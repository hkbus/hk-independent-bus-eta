import React, { useState, useCallback } from "react";
import {
  DEFAULT_DAY_SCHEDULE,
  DEFAULT_ROUTE_COLLECTION,
  RouteCollection,
} from "./typing";
import { isStrings } from "./utils";
import { produce, current } from "immer";

interface CollectionState {
  savedEtas: string[];
  collections: RouteCollection[];
  collectionDrawerRoute: string | null;
  collectionIdx: number | null;
}

interface CollectionContextValue extends CollectionState {
  updateSavedEtas: (keys: string) => void;
  setSavedEtas: (savedEtas: string[]) => void;
  setCollectionDrawerRoute: (routeId: string | null) => void;
  addNewCollection: () => void;
  removeCollection: (idx: number) => void;
  toggleCollectionDialog: (idx: number | null) => void;
  updateCollectionName: (v: any) => void;
  addCollectionSchedule: () => void;
  removeCollectionSchedule: (idx: number) => void;
  updateCollectionSchedule: (idx: number, field: string, value: any) => void;
  toggleCollectionEta: (eta: string, idx: number | null) => void;
  setCollectionEtas: (etas: string[]) => void;
  setCollections: (collections: RouteCollection[]) => void;
}

const CollectionContext = React.createContext<CollectionContextValue>(null);

export const CollectionContextProvider = ({ children }) => {
  type State = CollectionState;
  const getInitialState = (): CollectionState => {
    const savedEtas: unknown = JSON.parse(localStorage.getItem("savedEtas"));
    return {
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

  const updateSavedEtas = useCallback((key: string) => {
    setStateRaw(
      produce((state: State) => {
        const prevSavedEtas = state.savedEtas;
        if (prevSavedEtas.includes(key)) {
          prevSavedEtas.splice(prevSavedEtas.indexOf(key), 1);
          localStorage.setItem(
            "savedEtas",
            JSON.stringify(current(prevSavedEtas))
          );
          state.savedEtas = prevSavedEtas;
          return;
        }
        const newSavedEtas = prevSavedEtas
          .concat(key)
          .filter((v, i, s) => s.indexOf(v) === i);
        localStorage.setItem("savedEtas", JSON.stringify(newSavedEtas));
        state.savedEtas = newSavedEtas;
      })
    );
  }, []);

  // for re-ordering
  const setSavedEtas = useCallback((savedEtas) => {
    setStateRaw(
      produce((state: State) => {
        localStorage.setItem("savedEtas", JSON.stringify(savedEtas));
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
        localStorage.setItem("collections", JSON.stringify(newCollections));
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
        localStorage.setItem("collections", JSON.stringify(newCollections));
        state.collections = newCollections;
        state.collectionIdx = null;
      })
    );
  }, []);

  const updateCollectionName = useCallback((v: any) => {
    setStateRaw(
      produce((state: State) => {
        const idx = state.collectionIdx;
        const newCollections = state.collections;
        newCollections[idx].name = v;
        localStorage.setItem("collections", JSON.stringify(newCollections));
        state.collections = newCollections;
      })
    );
  }, []);

  const updateCollectionSchedule = useCallback(
    (idx: number, field: string, value: any) => {
      setStateRaw(
        produce((state: State) => {
          const collectionIdx = state.collectionIdx;
          const newCollections = state.collections;
          newCollections[collectionIdx].schedules[idx][field] = value;
          localStorage.setItem("collections", JSON.stringify(newCollections));
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
        localStorage.setItem("collections", JSON.stringify(newCollections));
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
        localStorage.setItem("collections", JSON.stringify(newCollections));
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
          localStorage.setItem("collections", JSON.stringify(newCollections));
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
        localStorage.setItem("collections", JSON.stringify(newCollections));
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
        localStorage.setItem("collections", JSON.stringify(collections));
        state.collections = collections;
      })
    );
  }, []);

  return (
    <CollectionContext.Provider
      value={{
        ...state,
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
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
};

export default CollectionContext;

export type { CollectionContextValue };
