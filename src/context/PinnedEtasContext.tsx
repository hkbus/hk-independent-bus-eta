import React, { useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { produce } from "immer";

export interface PinnedEtasState {
  /**
   * ETAs for PinDialog
   */
  pinnedEtas: string[];
  /**
   * boolean hide
   */
  isHidden: boolean;
}

interface PinnedEtasContextValue extends PinnedEtasState {
  togglePinnedEta: (eta: string) => void;
  tooglePinnedEtasDialog: () => void;
  closePinnedEtas: () => void;
}

interface PinnedEtasContextProviderProps {
  children: ReactNode;
}

const PinnedEtasContext = React.createContext<PinnedEtasContextValue>(
  {} as PinnedEtasContextValue
);

export const PinnedEtasContextProvider = ({
  children,
}: PinnedEtasContextProviderProps) => {
  const getInitialState = (): PinnedEtasState => {
    return {
      pinnedEtas: [],
      isHidden: false,
    };
  };

  type State = PinnedEtasState;
  const [state, setStateRaw] = useState(getInitialState);

  const togglePinnedEta = useCallback((eta: string) => {
    setStateRaw(
      produce((state: State) => {
        if (state.pinnedEtas.includes(eta)) {
          state.pinnedEtas = state.pinnedEtas.filter(
            (pinnedEta) => eta !== pinnedEta
          );
        } else {
          state.isHidden = false;
          state.pinnedEtas = [...state.pinnedEtas, eta];
        }
      })
    );
  }, []);

  const tooglePinnedEtasDialog = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        state.isHidden = !state.isHidden;
      })
    );
  }, []);

  const closePinnedEtas = useCallback(() => {
    setStateRaw(
      produce((state: State) => {
        state.pinnedEtas = [];
      })
    );
  }, []);

  const contextValue: PinnedEtasContextValue = useMemo(
    () => ({
      ...state,
      togglePinnedEta,
      tooglePinnedEtasDialog,
      closePinnedEtas,
    }),
    [closePinnedEtas, state, togglePinnedEta, tooglePinnedEtasDialog]
  );

  return (
    <PinnedEtasContext.Provider value={contextValue}>
      {children}
    </PinnedEtasContext.Provider>
  );
};

export default PinnedEtasContext;
export type { PinnedEtasContextValue };
