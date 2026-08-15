import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import debounce from "lodash.debounce";
import AppContext from "./AppContext";
import CollectionContext from "../CollectionContext";
import useLanguage from "../hooks/useTranslation";
import {
  generateSyncToken,
  isSyncConfigured,
  pullSyncDoc,
  pushSyncDoc,
} from "../utils/syncApi";
import {
  applyFieldsSinceBase,
  createSyncDoc,
  loadSyncDoc,
  readFields,
  saveSyncDoc,
  SyncDocShape,
} from "../utils/syncDoc";

export type SyncStatus = "off" | "syncing" | "synced" | "error";

const SYNC_TOKEN_STORAGE_KEY = "syncToken";
const SYNC_LAST_FIELDS_STORAGE_KEY = "syncLastFields";
const SYNC_PUSH_DEBOUNCE_MS = 1500;

interface SyncContextValue {
  isConfigured: boolean;
  isEnabled: boolean;
  status: SyncStatus;
  lastSyncedAt: number | null;
  token: string | null;
  createSyncGroup: () => Promise<void>;
  joinSyncGroup: (token: string) => Promise<void>;
  leaveSyncGroup: () => void;
  syncNow: () => Promise<void>;
}

const SyncContext = React.createContext<SyncContextValue>(
  {} as SyncContextValue
);

interface SyncContextProviderProps {
  children: ReactNode;
}

export const SyncContextProvider = ({ children }: SyncContextProviderProps) => {
  const appCtx = useContext(AppContext);
  const collectionCtx = useContext(CollectionContext);
  const language = useLanguage();

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(SYNC_TOKEN_STORAGE_KEY)
  );
  const [status, setStatus] = useState<SyncStatus>(token ? "syncing" : "off");
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  // This device's synced fields as of its last successful sync — the
  // baseline runSyncOnce diffs against to tell "I added this" apart from
  // "another device added this and I never had it" (see
  // applyFieldsSinceBase in syncDoc.ts). Persisted so a page reload doesn't
  // lose it, which would otherwise make the next sync treat every favorite
  // this device removed since as "never removed" and resurrect it.
  const [initialLastSyncedFields] = useState<SyncDocShape | null>(() => {
    try {
      const raw = localStorage.getItem(SYNC_LAST_FIELDS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SyncDocShape) : null;
    } catch {
      return null;
    }
  });
  const lastSyncedFieldsRef = useRef<SyncDocShape | null>(
    initialLastSyncedFields
  );

  const {
    savedStops,
    savedEtas,
    collections,
    collectionDrawerRoute,
    collectionIdx,
    importCollectionState,
  } = collectionCtx;
  const {
    _colorMode,
    energyMode,
    platformMode,
    etaFormat,
    numPadOrder,
    isRouteFilter,
    busSortOrder,
    annotateScheduled,
    isRecentSearchShown,
    fontSize,
    searchRange,
    searchRoute,
    selectedRoute,
    geoPermission,
    manualGeolocation,
    compassPermission,
    routeSearchHistory,
    vibrateDuration,
    isVisible,
    analytics,
    refreshInterval,
    isSearching,
    importAppState,
    changeLanguage,
  } = appCtx;

  // readFieldsRef/applyFieldsRef always point at the latest closures so the
  // mount/visibility effect below can depend on just `token`, not on every
  // synced field (which would otherwise re-run it constantly).
  const readCurrentFields = useCallback(
    (): SyncDocShape => ({
      savedStops,
      savedEtas,
      collections,
      _colorMode,
      energyMode,
      platformMode,
      etaFormat,
      numPadOrder,
      isRouteFilter,
      busSortOrder,
      annotateScheduled,
      isRecentSearchShown,
      fontSize,
      searchRange,
      lang: language,
    }),
    [
      savedStops,
      savedEtas,
      collections,
      _colorMode,
      energyMode,
      platformMode,
      etaFormat,
      numPadOrder,
      isRouteFilter,
      busSortOrder,
      annotateScheduled,
      isRecentSearchShown,
      fontSize,
      searchRange,
      language,
    ]
  );

  const applyMergedFields = useCallback(
    (merged: SyncDocShape) => {
      importCollectionState({
        savedStops: merged.savedStops,
        savedEtas: merged.savedEtas,
        collections: merged.collections,
        collectionDrawerRoute,
        collectionIdx,
      });
      importAppState({
        searchRoute,
        selectedRoute,
        geoPermission,
        manualGeolocation,
        compassPermission,
        routeSearchHistory,
        vibrateDuration,
        isVisible,
        analytics,
        refreshInterval,
        isSearching,
        isRouteFilter: merged.isRouteFilter,
        busSortOrder: merged.busSortOrder,
        numPadOrder: merged.numPadOrder,
        etaFormat: merged.etaFormat,
        _colorMode: merged._colorMode,
        energyMode: merged.energyMode,
        platformMode: merged.platformMode,
        annotateScheduled: merged.annotateScheduled,
        isRecentSearchShown: merged.isRecentSearchShown,
        fontSize: merged.fontSize,
        searchRange: merged.searchRange,
      });
      if (merged.lang !== language) {
        changeLanguage(merged.lang);
      }
    },
    [
      importCollectionState,
      collectionDrawerRoute,
      collectionIdx,
      importAppState,
      searchRoute,
      selectedRoute,
      geoPermission,
      manualGeolocation,
      compassPermission,
      routeSearchHistory,
      vibrateDuration,
      isVisible,
      analytics,
      refreshInterval,
      isSearching,
      changeLanguage,
      language,
    ]
  );

  // Pull-apply-push: pulls the group's current doc and layers exactly what
  // changed locally since this device's last sync on top of it (via
  // applyFieldsSinceBase, which diffs against lastSyncedFieldsRef and
  // mutates the shared list objects in place rather than replacing them —
  // see syncDoc.ts) so savedStops/savedEtas genuinely merge across devices
  // instead of one device's write clobbering another's. The doc is never
  // rebuilt from scratch via createSyncDoc except for the very first push of
  // a brand new group (no remote yet) — every later cycle, on any device,
  // continues the same shared lineage so the underlying list objects stay
  // identified.
  //
  // Mount, visibility-change, and the local-field-change watcher can all ask
  // to sync around the same time. Since each run both reads and overwrites
  // local state (via applyMergedFields), overlapping runs would race and
  // could clobber each other's writes. inFlightRef/pendingRef below coalesce
  // concurrent calls into "run once more after the current run finishes"
  // instead of letting them execute in parallel.
  const inFlightRef = useRef<Promise<void> | null>(null);
  const pendingRef = useRef(false);

  const runSyncOnce = useCallback(
    async (syncToken: string) => {
      setStatus("syncing");
      try {
        const remote = await pullSyncDoc(syncToken);
        const currentFields = readCurrentFields();
        const doc = remote
          ? await applyFieldsSinceBase(
              await loadSyncDoc(remote.bytes),
              lastSyncedFieldsRef.current,
              currentFields
            )
          : await createSyncDoc(currentFields);
        const merged = readFields(doc);
        applyMergedFields(merged);
        const bytes = await saveSyncDoc(doc);
        await pushSyncDoc(syncToken, bytes);
        lastSyncedFieldsRef.current = merged;
        localStorage.setItem(
          SYNC_LAST_FIELDS_STORAGE_KEY,
          JSON.stringify(merged)
        );
        setLastSyncedAt(Date.now());
        setStatus("synced");
      } catch (e) {
        console.error("Sync failed", e);
        setStatus("error");
      }
    },
    [readCurrentFields, applyMergedFields]
  );

  // Dereferenced through a ref (rather than closing over runSyncOnce
  // directly) so a coalesced retry below always calls the *latest* version —
  // one bound to a fresh readCurrentFields — instead of the closure that was
  // current when this particular runSync() call started. Without this, a
  // retry coalesced during the very first sync would re-run bound to
  // pre-merge field values even though local state (and the ref) had long
  // since moved on, silently reverting the merge it just applied.
  const runSyncOnceRef = useRef(runSyncOnce);
  useEffect(() => {
    runSyncOnceRef.current = runSyncOnce;
  }, [runSyncOnce]);

  const runSync = useCallback((syncToken: string): Promise<void> => {
    if (inFlightRef.current) {
      pendingRef.current = true;
      return inFlightRef.current;
    }
    const exec = async () => {
      do {
        pendingRef.current = false;
        await runSyncOnceRef.current(syncToken);
      } while (pendingRef.current);
    };
    const promise = exec().finally(() => {
      inFlightRef.current = null;
    });
    inFlightRef.current = promise;
    return promise;
  }, []);

  const runSyncRef = useRef(runSync);
  useEffect(() => {
    runSyncRef.current = runSync;
  }, [runSync]);

  const createSyncGroup = useCallback(async () => {
    const newToken = generateSyncToken();
    localStorage.setItem(SYNC_TOKEN_STORAGE_KEY, newToken);
    localStorage.removeItem(SYNC_LAST_FIELDS_STORAGE_KEY);
    lastSyncedFieldsRef.current = null;
    setToken(newToken);
    await runSyncRef.current(newToken);
  }, []);

  const joinSyncGroup = useCallback(async (newToken: string) => {
    // Any remembered baseline belongs to whatever group this device was
    // previously in (or none) — irrelevant to the group being joined now.
    localStorage.setItem(SYNC_TOKEN_STORAGE_KEY, newToken);
    localStorage.removeItem(SYNC_LAST_FIELDS_STORAGE_KEY);
    lastSyncedFieldsRef.current = null;
    setToken(newToken);
    await runSyncRef.current(newToken);
  }, []);

  const leaveSyncGroup = useCallback(() => {
    localStorage.removeItem(SYNC_TOKEN_STORAGE_KEY);
    localStorage.removeItem(SYNC_LAST_FIELDS_STORAGE_KEY);
    lastSyncedFieldsRef.current = null;
    setToken(null);
    setStatus("off");
    setLastSyncedAt(null);
  }, []);

  const syncNow = useCallback(async () => {
    if (!token) return;
    await runSyncRef.current(token);
  }, [token]);

  // Initial pull on mount/token-change, again whenever the app becomes
  // visible (e.g. switching back from another app), and periodically while
  // visible — there's no push channel from the backend, so a device that
  // stays open and idle would otherwise never see another device's changes.
  const SYNC_POLL_INTERVAL_MS = 10_000;
  useEffect(() => {
    if (!token) return;
    runSyncRef.current(token);
    const onVisibilityChange = () => {
      if (!document.hidden) runSyncRef.current(token);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    const intervalId = setInterval(() => {
      if (!document.hidden) runSyncRef.current(token);
    }, SYNC_POLL_INTERVAL_MS);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearInterval(intervalId);
    };
  }, [token]);

  // Debounced push whenever the synced subset of local state changes. This
  // also re-fires once after a pull brings in remote changes (since it
  // applies to the same fields) — a harmless extra no-op round trip.
  const debouncedSync = useRef(
    debounce(() => {
      if (runSyncRef.current) {
        const currentToken = localStorage.getItem(SYNC_TOKEN_STORAGE_KEY);
        if (currentToken) runSyncRef.current(currentToken);
      }
    }, SYNC_PUSH_DEBOUNCE_MS)
  ).current;

  useEffect(() => {
    return () => {
      debouncedSync.cancel();
    };
  }, [debouncedSync]);

  // Skip firing when the tracked fields' *content* hasn't actually changed —
  // applyMergedFields (after a pull) re-sets state to values that are often
  // identical to what's already there, just as new object/array references,
  // which would otherwise retrigger this effect and cause a pointless sync.
  const lastFieldsSnapshotRef = useRef<string | null>(null);
  useEffect(() => {
    if (!token) return;
    const snapshot = JSON.stringify(readCurrentFields());
    if (snapshot === lastFieldsSnapshotRef.current) return;
    lastFieldsSnapshotRef.current = snapshot;
    debouncedSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    token,
    savedStops,
    savedEtas,
    collections,
    _colorMode,
    energyMode,
    platformMode,
    etaFormat,
    numPadOrder,
    isRouteFilter,
    busSortOrder,
    annotateScheduled,
    isRecentSearchShown,
    fontSize,
    searchRange,
    language,
  ]);

  const contextValue: SyncContextValue = useMemo(
    () => ({
      isConfigured: isSyncConfigured(),
      isEnabled: token !== null,
      status,
      lastSyncedAt,
      token,
      createSyncGroup,
      joinSyncGroup,
      leaveSyncGroup,
      syncNow,
    }),
    [
      token,
      status,
      lastSyncedAt,
      createSyncGroup,
      joinSyncGroup,
      leaveSyncGroup,
      syncNow,
    ]
  );

  return (
    <SyncContext.Provider value={contextValue}>{children}</SyncContext.Provider>
  );
};

export default SyncContext;
export type { SyncContextValue };
