import React, { useMemo } from "react";
import type { ReactNode } from "react";
import type { DatabaseType } from "./db";

interface DatabaseContextValue {
  db: DatabaseType;
  AppTitle: string;
  renewDb: () => Promise<void>;
}

interface DbProviderProps extends DatabaseContextValue {
  children: ReactNode;
}

const DbContext = React.createContext<DatabaseContextValue>(null);

export const DbProvider = ({
  AppTitle,
  db,
  renewDb,
  children,
}: DbProviderProps) => {
  const contextValue = useMemo(
    () => ({ AppTitle, db, renewDb }),
    [AppTitle, db, renewDb]
  );
  return (
    <DbContext.Provider value={contextValue}>{children}</DbContext.Provider>
  );
};

export default DbContext;
export type { DatabaseContextValue, DatabaseType };
