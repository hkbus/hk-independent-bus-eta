import { fetchEtaDb, fetchEtaDbMd5 } from "hk-bus-eta";
import type { EtaDb } from "hk-bus-eta";
import { decompress as decompressJson } from "lzutf8-light";

const isEtaDb = (input: unknown): input is EtaDb => {
  return (
    input !== null &&
    typeof input === "object" &&
    "routeList" in input &&
    "stopList" in input &&
    "stopMap" in input &&
    "holidays" in input &&
    "serviceDayMap" in input &&
    Array.isArray(input["holidays"]) &&
    input["holidays"].length > 0
  );
};

// implant the DB Context logic into code to avoid loading error
export const DB_CONTEXT_VERSION = "1.2.0";

const decompressJsonString = (txt: Uint8Array | Buffer | string): EtaDb => {
  const ret = JSON.parse(decompressJson(txt, { inputEncoding: "Base64" }));
  ret.routeList = Object.keys(ret.routeList)
    .sort()
    .reduce(
      (acc, k) => {
        acc[k.replace(/\+/g, "-").replace(/ /g, "-").toUpperCase()] =
          ret.routeList[k];
        return acc;
      },
      {} as EtaDb["routeList"]
    );
  return ret;
};

export interface DatabaseType extends EtaDb {
  schemaVersion: string;
  versionMd5: string;
  updateTime: number;
}

// to optimize the data fetching significantly
// we define the fetchDbFunc outside the components
// and we hence able to fetch data before rendering
/**
 *
 * @param {boolean} forceRenew
 * @returns {Promise<DatabaseType>}
 */
export const fetchDbFunc = async (
  forceRenew = false
): Promise<DatabaseType> => {
  const autoRenew = !!JSON.parse(localStorage.getItem("autoRenew") ?? "false");
  if (localStorage.getItem("dbv") !== DB_CONTEXT_VERSION) {
    console.log("New DB, will refetch data");
    localStorage.removeItem("db");
    localStorage.removeItem("versionMd5");
    localStorage.removeItem("routeList");
    localStorage.removeItem("stopList");
    localStorage.removeItem("stopMap");
    localStorage.setItem("dbv", DB_CONTEXT_VERSION);
  }
  const schemaVersion = localStorage.getItem("schemaVersion") ?? "";
  const versionMd5 = localStorage.getItem("versionMd5") ?? "";
  const lastUpdateTime = parseInt(
    localStorage.getItem("updateTime") || "" + Date.now(),
    10
  );
  const raw = localStorage.getItem("db");
  const loadStoredDb = (_raw: string | null): Promise<DatabaseType> =>
    new Promise((resolve, reject) => {
      try {
        if (_raw === null) {
          reject("localStorage is null");
        } else {
          const db = decompressJsonString(_raw);
          resolve({
            schemaVersion,
            versionMd5,
            updateTime: lastUpdateTime,
            holidays: db.holidays,
            routeList: db.routeList,
            stopList: db.stopList,
            stopMap: db.stopMap,
            serviceDayMap: db.serviceDayMap,
          });
        }
      } catch (e) {
        reject(e);
      }
    });

  if (raw !== null && !forceRenew) {
    let isOffline = !navigator.onLine;
    let shouldAutoRenew =
      autoRenew && Date.now() - lastUpdateTime > 7 * 24 * 3600 * 1000;
    if (isOffline || !shouldAutoRenew) {
      const db = await loadStoredDb(raw);
      return db;
    }
  }

  try {
    const [_schemaVersion, _md5] = await Promise.all([
      fetch("/schema-version.txt").then((res) => res.text()),
      fetchEtaDbMd5(),
    ]);
    let needRenew = forceRenew;
    if (schemaVersion !== _schemaVersion) {
      needRenew = true;
    }
    if (versionMd5 !== _md5) {
      needRenew = true;
    }
    if (!needRenew) {
      const db = await loadStoredDb(raw);
      if (isEtaDb(db)) {
        return db;
      }
    }
    const updateTime = Date.now() + "";
    localStorage.setItem("updateTime", updateTime);
    return new Promise((resolve_1) => {
      const timerId = setTimeout(() => {
        if (!forceRenew && raw !== null) {
          const _cachedDb = loadStoredDb(raw);
          if (isEtaDb(_cachedDb)) {
            resolve_1(_cachedDb);
          }
        }
      }, 1000);
      fetchEtaDb()
        .then((db_1) => ({
          ...db_1,
          routeList: Object.keys(db_1.routeList)
            .sort()
            .reduce(
              (acc, k) => {
                acc[k.replace(/\+/g, "-").replace(/ /g, "-").toUpperCase()] =
                  db_1.routeList[k];
                return acc;
              },
              {} as EtaDb["routeList"]
            ),
          schemaVersion: _schemaVersion,
          versionMd5: _md5,
          updateTime: parseInt(updateTime),
        }))
        .then((ret) => {
          localStorage.setItem("schemaVersion", _schemaVersion);
          localStorage.setItem("versionMd5", _md5);
          clearTimeout(timerId);
          resolve_1(ret);
        });
    });
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
      serviceDayMap: {},
    };
  }
};
