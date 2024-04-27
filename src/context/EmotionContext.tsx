import React, { useCallback, useEffect, useMemo, useState } from "react";

interface EmotionContextState {
  checkIns: EmotionCheckIn[];
}

interface EmotionContextValue extends EmotionContextState {
  lastCheckIn: EmotionCheckIn;
  isRemind: boolean;
  addCheckin: (checkin: EmotionCheckIn) => void;
  updateLastCheckIn: (checkin: EmotionCheckIn) => void;
}

interface EmotionContextProviderProps {
  children: React.ReactNode;
}

const EmotionContext = React.createContext<EmotionContextValue>(
  {} as EmotionContextValue
);

export const EmotionContextProvider = ({
  children,
}: EmotionContextProviderProps) => {
  const [state, setState] = useState<EmotionContextState>(DEFAULT_STATE);

  const isRemind = useMemo(() => {
    if (state.checkIns.length === 0) return true;
    return state.checkIns.slice(-1)[0].ts <= Date.now() - 16 * 60 * 60 * 1000;
  }, [state.checkIns]);

  const addCheckin = useCallback((checkIn: EmotionCheckIn) => {
    setState((prev) => ({
      ...prev,
      checkIns: [...prev.checkIns, checkIn],
    }));
  }, []);

  const lastCheckIn = useMemo(
    () => state.checkIns.slice(-1)[0],
    [state.checkIns]
  );

  const updateLastCheckIn = useCallback((checkIn: EmotionCheckIn) => {
    setState((prev) => ({
      ...prev,
      checkIns: [...prev.checkIns.slice(0, -1), checkIn],
    }));
  }, []);

  useEffect(() => {
    localStorage.setItem("emotion-checkins", JSON.stringify(state.checkIns));
  }, [state.checkIns]);

  const contextValue = useMemo(
    () => ({
      ...state,
      lastCheckIn,
      isRemind,
      addCheckin,
      updateLastCheckIn,
    }),
    [state, lastCheckIn, isRemind, addCheckin, updateLastCheckIn]
  );

  return (
    <EmotionContext.Provider value={contextValue}>
      {children}
    </EmotionContext.Provider>
  );
};

export default EmotionContext;

const DEFAULT_STATE: EmotionContextState = {
  checkIns: JSON.parse(localStorage.getItem("emotion-checkins") ?? "[]"),
};

export interface EmotionCheckIn {
  happiness?: "😄" | "😊" | "🙂" | "😐" | "😟" | "😫" | "😭" | null;
  moodScene?:
    | "Work"
    | "Gathering"
    | "Exercise"
    | "Leisure"
    | "Dining"
    | "Rest"
    | null;
  gratitudeObj?:
    | "Self"
    | "Friend"
    | "Family"
    | "Partner"
    | "Fellow"
    | "Stranger"
    | null;
  gratitudeCnt?: "0" | "1" | "2" | "3" | "4" | "5+" | null;
  ts: number;
}

export const CheckInOptions: Record<keyof EmotionCheckIn, string[]> = {
  happiness: ["😄", "😊", "🙂", "😐", "😟", "😫", "😭"],
  moodScene: ["Gathering", "Exercise", "Work", "Leisure", "Dining", "Rest"],
  gratitudeObj: ["Friend", "Partner", "Family", "Fellow", "Self", "Stranger"],
  gratitudeCnt: ["0", "1", "2", "3", "4", "5+"],
  ts: [],
};
