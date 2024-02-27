import React, { useState, useCallback, useEffect } from "react";
import {
  DEFAULT_DAY_SCHEDULE,
  DEFAULT_ROUTE_COLLECTION,
  DaySchedule,
  RouteCollection,
} from "./typing";
import { isStrings } from "./utils";
import { produce } from "immer";

export interface CollectionState {
  savedStops: string[];
  savedEtas: string[];
  collections: RouteCollection[];
  collectionDrawerRoute: string | null;
  collectionIdx: number | null;
}

interface CollectionContextValue extends CollectionState {
  updateSavedStops: (key: string) => void;
  setSavedStops: (savedStops: string[]) => void;
  updateSavedEtas: (keys: string) => void;
  setSavedEtas: (savedEtas: string[]) => void;
  setCollectionDrawerRoute: (routeId: string | null) => void;
  addNewCollection: () => void;
  removeCollection: (idx: number) => void;
  toggleCollectionDialog: (idx: number | null) => void;
  updateCollectionName: (v: string) => void;
  addCollectionSchedule: () => void;
  removeCollectionSchedule: (idx: number) => void;
  updateCollectionSchedule: <T extends keyof DaySchedule>(idx: number, field: T, value: DaySchedule[T]) => void;
  toggleCollectionEta: (eta: string, idx: number | null) => void;
  setCollectionEtas: (etas: string[]) => void;
  setCollections: (collections: RouteCollection[]) => void;
  importCollectionState: (collectionState: CollectionState) => void;
}

const CollectionContext = React.createContext<CollectionContextValue>(null);

export const CollectionContextProvider = ({ children }) => {
  type State = CollectionState;
  const getInitialState = (): CollectionState => {
    const savedStops: unknown = JSON.parse(localStorage.getItem("savedStops"));
    const savedEtas: unknown = JSON.parse(localStorage.getItem("savedEtas"));
    return {
      savedStops:
        Array.isArray(savedStops) && isStrings(savedStops) ? savedStops : [],
      savedEtas:
        Array.isArray(savedEtas) && isStrings(savedEtas) ? savedEtas : [],
      collections: JSON.parse(localStorage.getItem("collections")) ?? [
        {
          name: "Home",
          list: [],
          schedules: Array(7)
            .fill(0)
            .map((v, idx) => ({
              ...DEFAULT_DAY_SCHEDULE,
              day: idx,
            })),
        },
        {
          name: "Work",
          list: [],
          schedules: [1, 2, 3, 4, 5].map((day) => ({
            day,
            start: {
              hour: 7,
              minute: 30,
            },
            end: {
              hour: 11,
              minute: 30,
            },
          })),
        },
      ],
      collectionDrawerRoute: null,
      collectionIdx: null,
    };
  };

  const [state, setStateRaw] = useState<CollectionState>(getInitialState());

  const updateSavedStops = useCallback((key: string) => {
    setStateRaw(
      produce((state: State) => {
        const prevSavedStops = state.savedStops;
        if (prevSavedStops.includes(key)) {
          prevSavedStops.splice(prevSavedStops.indexOf(key), 1);
          state.savedStops = prevSavedStops;
          return;
        }
        const newSavedStops = prevSavedStops
          .concat(key)
          .filter((v, i, s) => s.indexOf(v) === i);
        state.savedStops = newSavedStops;
      })
    );
  }, []);

  // for re-ordering
  const setSavedStops = useCallback((savedStops) => {
    setStateRaw(
      produce((state: State) => {
        state.savedStops = savedStops;
      })
    );
  }, []);

  const updateSavedEtas = useCallback((key: string) => {
    setStateRaw(
      produce((state: State) => {
        const prevSavedEtas = state.savedEtas;
        if (prevSavedEtas.includes(key)) {
          prevSavedEtas.splice(prevSavedEtas.indexOf(key), 1);
          state.savedEtas = prevSavedEtas;
          return;
        }
        const newSavedEtas = prevSavedEtas
          .concat(key)
          .filter((v, i, s) => s.indexOf(v) === i);
        state.savedEtas = newSavedEtas;
      })
    );
  }, []);

  // for re-ordering
  const setSavedEtas = useCallback((savedEtas) => {
    setStateRaw(
      produce((state: State) => {
        state.savedEtas = savedEtas;
      })
    );
  }, []);

  const toggleCollectionDialog = useCallback((idx: number | null) => {
    setStateRaw(
      produce((state: State) => {
        state.collectionIdx = idx;
      })
    );
  }, []);

  const addNewCollection = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const newCollections = state.collections.concat(
          DEFAULT_ROUTE_COLLECTION
        );
        state.collections = newCollections;
        state.collectionIdx = newCollections.length - 1;
      })
    );
  }, []);

  const removeCollection = useCallback((idx: number) => {
    setStateRaw(
      produce((state: State) => {
        const newCollections = state.collections.filter(
          (v, _idx) => idx !== _idx
        );
        state.collections = newCollections;
        state.collectionIdx = null;
      })
    );
  }, []);

  const updateCollectionName = useCallback((v: string) => {
    setStateRaw(
      produce((state: State) => {
        const idx = state.collectionIdx;
        const newCollections = state.collections;
        newCollections[idx].name = v;
        state.collections = newCollections;
      })
    );
  }, []);

  const updateCollectionSchedule = useCallback<CollectionContextValue['updateCollectionSchedule']>(
    (idx, field, value) => {
      setStateRaw(
        produce((state: State) => {
          const collectionIdx = state.collectionIdx;
          const newCollections = state.collections;
          newCollections[collectionIdx].schedules[idx][field] = value;
          state.collections = newCollections;
        })
      );
    },
    []
  );

  const addCollectionSchedule = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        const collectionIdx = state.collectionIdx;
        const newCollections = state.collections;
        newCollections[collectionIdx].schedules =
          newCollections[collectionIdx].schedules.concat(DEFAULT_DAY_SCHEDULE);
        state.collections = newCollections;
      })
    );
  }, []);

  const removeCollectionSchedule = useCallback((idx: number) => {
    setStateRaw(
      produce((state: State) => {
        const collectionIdx = state.collectionIdx;
        const newCollections = state.collections;
        newCollections[collectionIdx].schedules = newCollections[
          collectionIdx
        ].schedules.filter((v, _idx) => idx !== _idx);
        state.collections = newCollections;
      })
    );
  }, []);

  const toggleCollectionEta = useCallback(
    (eta: string, idx: number | null) => {
      if (idx === null) {
        updateSavedEtas(eta);
        return;
      }
      setStateRaw(
        produce((state: State) => {
          const newCollections = state.collections;
          if (newCollections[idx].list.includes(eta)) {
            newCollections[idx].list = newCollections[idx].list.filter(
              (v) => v !== eta
            );
          } else {
            newCollections[idx].list = [eta].concat(newCollections[idx].list);
          }
          state.collections = newCollections;
        })
      );
    },
    [updateSavedEtas]
  );

  // for re-ordering
  const setCollectionEtas = useCallback((etas: string[]) => {
    setStateRaw(
      produce((state: State) => {
        const collectionIdx = state.collectionIdx;
        const newCollections = state.collections;
        newCollections[collectionIdx].list = etas;
        state.collections = newCollections;
      })
    );
  }, []);

  const setCollectionDrawerRoute = useCallback(
    (collectionDrawerRoute: string | null) => {
      setStateRaw(
        produce((state: State) => {
          state.collectionDrawerRoute = collectionDrawerRoute;
        })
      );
    },
    []
  );

  const setCollections = useCallback((collections: RouteCollection[]) => {
    setStateRaw(
      produce((state: State) => {
        state.collections = collections;
      })
    );
  }, []);

  const importCollectionState = useCallback(
    (collectionState: CollectionState) => {
      setStateRaw(
        produce((state: State) => {
          Object.entries(collectionState).forEach(([key, value]) => {
            state[key] = value;
          });
        })
      );
    },
    []
  );

  useEffect(() => {
    localStorage.setItem("savedEtas", JSON.stringify(state.savedEtas));
  }, [state.savedEtas]);

  useEffect(() => {
    localStorage.setItem("savedStops", JSON.stringify(state.savedStops));
  }, [state.savedStops]);

  useEffect(() => {
    localStorage.setItem("collections", JSON.stringify(state.collections));
  }, [state.collections]);

  return (
    <CollectionContext.Provider
      value={{
        ...state,
        updateSavedStops,
        setSavedStops,
        updateSavedEtas,
        setSavedEtas,
        setCollectionDrawerRoute,
        addNewCollection,
        removeCollection,
        toggleCollectionDialog,
        updateCollectionName,
        updateCollectionSchedule,
        addCollectionSchedule,
        removeCollectionSchedule,
        toggleCollectionEta,
        setCollectionEtas,
        setCollections,
        importCollectionState,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
};

export default CollectionContext;

export type { CollectionContextValue };
