import type { RouteList, StopList, StopMap } from "hk-bus-eta";

// implant the DB Context logic into code to avoid loading error
export const DB_CONTEXT_VERSION = "1.2.0";

export type DatabaseType = {
  schemaVersion: string;
  versionMd5: string;
  updateTime: number;
  holidays?: string[];
  routeList?: RouteList;
  stopList?: StopList;
  stopMap?: StopMap;
};

// to optimize the data fetching significantly
// we define the fetchDbFunc outside the components
// and we hence able to fetch data before rendering
/**
 *
 * @param {boolean} forceRenew
 * @returns {Promise<DatabaseType>}
 */
export const fetchDbFunc = async (
  forceRenew: boolean = false
): Promise<DatabaseType> => {
  if (localStorage.getItem("dbv") !== DB_CONTEXT_VERSION) {
    console.log("New DB, will refetch data");
    localStorage.removeItem("versionMd5");
    localStorage.removeItem("routeList");
    localStorage.removeItem("stopList");
    localStorage.removeItem("stopMap");
    localStorage.setItem("dbv", DB_CONTEXT_VERSION);
  }
  const schemaVersion = localStorage.getItem("schemaVersion");
  const versionMd5 = localStorage.getItem("versionMd5");
  const lastUpdateTime = parseInt(
    localStorage.getItem("updateTime") || "" + Date.now(),
    10
  );

  const fetchEtaObj = await import("hk-bus-eta").then((mod) => mod.fetchEtaObj);
  const fetchEtaObjMd5 = await import("hk-bus-eta").then(
    (mod) => mod.fetchEtaObjMd5
  );
  try {
    const [_schemaVersion, _md5] = await Promise.all([
      fetch("/schema-version.txt").then((res) => res.text()),
      fetchEtaObjMd5(),
    ]);
    let needRenew = true;
    if (schemaVersion !== _schemaVersion) {
      needRenew = true;
    }
    if (versionMd5 !== _md5) {
      needRenew = true;
    }
    const updateTime = Date.now() + "";
    localStorage.setItem("updateTime", updateTime);
    //database will be cached by service worker
    const db_1 = await fetchEtaObj();
    localStorage.setItem("schemaVersion", _schemaVersion);
    localStorage.setItem("versionMd5", _md5);
    return {
      ...db_1,
      routeList: Object.keys(db_1.routeList)
        .sort()
        .reduce((acc, k) => {
          acc[k.replace(/\+/g, "-").replace(/ /g, "-").toUpperCase()] =
            db_1.routeList[k];
          return acc;
        }, {}),
      schemaVersion: _schemaVersion,
      versionMd5: _md5,
      updateTime: parseInt(updateTime),
    };
  } catch (e) {
    console.error("cannot get db", e);
    return {
      schemaVersion: "",
      versionMd5: "",
      updateTime: lastUpdateTime,
      holidays: [],
      routeList: {},
      stopList: {},
      stopMap: {},
    };
  }
};
