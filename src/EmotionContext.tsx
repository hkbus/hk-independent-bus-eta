import React, { useCallback, useEffect, useMemo, useState } from "react";

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
    return state.checkIns.slice(-1)[0].ts <= Date.now() - 20 * 60 * 60 * 1000;
  }, [state.checkIns]);

  const addCheckin = useCallback((checkIn: EmotionCheckIn) => {
    setState((prev) => ({
      ...prev,
      checkIns: [...prev.checkIns, checkIn],
    }));
  }, []);

  useEffect(() => {
    localStorage.setItem("emotion-checkins", JSON.stringify(state.checkIns));
  }, [state.checkIns]);

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

const DEFAULT_STATE: EmotionContextState = {
  checkIns: JSON.parse(localStorage.getItem("emotion-checkins") ?? "[]"),
};

export interface EmotionCheckIn {
  happiness?: "😄" | "😊" | "🙂" | "😟" | "😫" | "😭";
  moodScene?: "Work" | "Gathering" | "Exercise" | "Leisure" | "Dining" | "Rest";
  gratitudeObj?:
    | "Self"
    | "Friend"
    | "Family"
    | "Partner"
    | "Fellow"
    | "Stranger"
    | "";
  ts: number;
}

export const CheckInOptions: Partial<Record<keyof EmotionCheckIn, string[]>> = {
  happiness: ["😄", "😊", "🙂", "😟", "😫", "😭"],
  moodScene: ["Gathering", "Exercise", "Work", "Leisure", "Dining", "Rest"],
  gratitudeObj: ["Friend", "Partner", "Family", "Fellow", "Self", "Stranger"],
};
