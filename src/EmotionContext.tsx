import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

interface EmotionContextState {
  checkIns: EmotionCheckIn[];
}

interface EmotionContextValue extends EmotionContextState {
  isRemind: boolean;
  addCheckin: (checkin: EmotionCheckIn) => void;
}

const EmotionContext = React.createContext<EmotionContextValue>(null);

export const EmotionContextProvider = ({ children }) => {
  const [state, setState] = useState<EmotionContextState>(DEFAULT_STATE);

  const isRemind = useMemo(() => {
    if (state.checkIns.length === 0) return true;
    return (
      state.checkIns.slice(-1)[0].ts <= Date.now() - 20 * 24 * 60 * 60 * 1000
    );
  }, [state.checkIns]);

  const addCheckin = useCallback((checkIn: EmotionCheckIn) => {
    setState((prev) => ({
      ...prev,
      checkIns: [...prev.checkIns, checkIn],
    }));
  }, []);

  return (
    <EmotionContext.Provider
      value={{
        ...state,
        isRemind,
        addCheckin,
      }}
    >
      {children}
    </EmotionContext.Provider>
  );
};

export default EmotionContext;

export interface EmotionCheckIn {
  happiness?: 0 | 1 | 2 | 3 | 4 | 5;
  moodScene?: "Work" | "Gathering" | "Exercise" | "Leisure" | "Dining" | "Rest";
  gratitudeObj?: "Self" | "Friend" | "Partner" | "Fellow" | "Stranger";
  ts: number;
}

const DEFAULT_STATE: EmotionContextState = {
  checkIns: JSON.parse(localStorage.getItem("emotion-checkins") ?? "[]"),
};
