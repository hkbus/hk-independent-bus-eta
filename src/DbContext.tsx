import React, { useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { isEmptyObj } from "./utils";
import { initDb, fetchDbFunc } from "./db";
import { compress as compressJson } from "lzutf8";

const getInitialDB = () => {
  return {
    routeList: initDb.db.routeList,
    stopList: initDb.db.stopList,
    stopMap: initDb.db.stopMap,
    schemaVersion: localStorage.getItem("schemaVersion") || "",
    versionMd5: localStorage.getItem("versionMd5") || "",
    updateTime: parseInt(localStorage.getItem("updateTime"), 10),
  };
};

type DatabaseType = ReturnType<typeof getInitialDB>;

interface DatabaseContextValue {
  db: DatabaseType;
  AppTitle: string;
  renewDb: () => Promise<void>;
}

interface DbProviderProps {
  children: ReactNode;
}

const DbContext = React.createContext<DatabaseContextValue>(null);

export const DbProvider = ({ children }: DbProviderProps) => {
  const AppTitle = "巴士到站預報 App";
  // route list & stop list & route-stop list
  const [db, setDb] = useState(getInitialDB);

  const loadData = ({
    db: { routeList, stopList, stopMap },
    versionMd5,
    schemaVersion,
  }) => {
    setDb({
      routeList,
      stopList,
      stopMap,
      versionMd5,
      schemaVersion,
      updateTime: Date.now(),
    });
  };
  const renewDb = useCallback(() => fetchDbFunc(true).then(loadData), []);
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

  return (
    <DbContext.Provider
      value={{
        AppTitle,
        db,
        renewDb,
      }}
    >
      {children}
    </DbContext.Provider>
  );
};

export default DbContext;
export type { DatabaseContextValue, DatabaseType };
