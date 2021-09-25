import React, { useEffect, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { isEmptyObj } from "./utils";
import { fetchDbFunc } from "./db";
import { compress as compressJson } from "lzutf8";
import type { DatabaseType } from "./db";

interface DatabaseContextValue {
  db: DatabaseType;
  AppTitle: string;
  renewDb: () => Promise<void>;
}

interface DbProviderProps {
  initialDb: DatabaseType;
  children: ReactNode;
}

const DbContext = React.createContext<DatabaseContextValue>(null);

export const DbProvider = ({ initialDb, children }: DbProviderProps) => {
  const AppTitle = "巴士到站預報 App （免費無廣告）";
  // route list & stop list & route-stop list
  const [db, setDb] = useState<DatabaseType>(initialDb);
  const renewDb = useCallback(
    () => fetchDbFunc(true).then((a) => setDb(a)),
    []
  );
  useEffect(() => {
    // skip if db is {}
    if (
      db &&
      !isEmptyObj(db.routeList) &&
      !isEmptyObj(db.stopList) &&
      !isEmptyObj(db.stopMap)
    ) {
      // TODO skip if db version is the same

      // make costly compression async
      setTimeout(() => {
        localStorage.setItem(
          "db",
          compressJson(JSON.stringify(db), { outputEncoding: "Base64" })
        );
      }, 0);
    }
  }, [db]);

  const contextValue = useMemo(
    () => ({ AppTitle, db, renewDb }),
    [db, renewDb]
  );

  return (
    <DbContext.Provider value={contextValue}>{children}</DbContext.Provider>
  );
};

export default DbContext;
export type { DatabaseContextValue, DatabaseType };
