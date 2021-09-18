import React, { useEffect, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { isEmptyObj } from "./utils";
import { initDb, fetchDbFunc } from "./db";
import { compress as compressJson } from "lzutf8";

interface RouteListEntry {
  co: string[];
  stops: Record<string, string[]>;
  dest: { zh: string; en: string };
  bound?: string;
  nlbId?: number;
  fares?: string[];
  faresHoliday?: string[];
  freq?: Record<string, Record<string, string[]>>
}

interface StopEntry {
  location: { lat: number; lng: number };
  name: { zh: string; en: string };
}

type StopMapEntry = Array<Array<string>>;

interface DatabaseType {
  routeList: Record<string, RouteListEntry>;
  stopList: Record<string, StopEntry>;
  stopMap: Record<string, StopMapEntry>;
  schemaVersion: string;
  versionMd5: string;
  updateTime: number;
}

interface DatabaseContextValue {
  db: DatabaseType;
  AppTitle: string;
  renewDb: () => Promise<void>;
}

interface DbProviderProps {
  children: ReactNode;
}

const getInitialDB = (): DatabaseType => {
  return {
    routeList: initDb.db.routeList,
    stopList: initDb.db.stopList,
    stopMap: initDb.db.stopMap,
    schemaVersion: localStorage.getItem("schemaVersion") || "",
    versionMd5: localStorage.getItem("versionMd5") || "",
    updateTime: parseInt(localStorage.getItem("updateTime"), 10),
  };
};

const DbContext = React.createContext<DatabaseContextValue>(null);

export const DbProvider = ({ children }: DbProviderProps) => {
  const AppTitle = "巴士到站預報 App （免費無廣告）";
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

  const contextValue = useMemo(
    () => ({ AppTitle, db, renewDb }),
    [db, renewDb]
  );

  return (
    <DbContext.Provider value={contextValue}>{children}</DbContext.Provider>
  );
};

export default DbContext;
export type {
  DatabaseContextValue,
  DatabaseType,
  StopMapEntry,
  StopEntry,
  RouteListEntry,
};
