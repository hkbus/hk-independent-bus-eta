import { fetchEtaObj, fetchEtaObjMd5 } from "hk-bus-eta";
import type { BusDb } from "hk-bus-eta";
import { decompress as decompressJson } from "lzutf8-light";

const isBusDb = (input: unknown): input is BusDb => {
  return (
    typeof input === "object" &&
    "routeList" in input &&
    "stopList" in input &&
    "stopMap" in input &&
    "holidays" in input &&
    Array.isArray(input["holidays"]) &&
    input["holidays"].length > 0
  );
};

// implant the DB Context logic into code to avoid loading error
export const DB_CONTEXT_VERSION = "1.2.0";

const decompressJsonString = (txt): BusDb => {
  try {
    const ret = JSON.parse(decompressJson(txt, { inputEncoding: "Base64" }));
    ret.routeList = Object.keys(ret.routeList)
      .sort()
      .reduce((acc, k) => {
        acc[k.replace(/\+/g, "-").replace(/ /g, "-").toUpperCase()] =
          ret.routeList[k];
        return acc;
      }, {});
    return ret;
  } catch (e) {
    // throw the error
    throw e;
  }
};

export interface DatabaseType extends BusDb {
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
  const autoRenew = !!JSON.parse(localStorage.getItem("autoRenew")) || false;
  if (localStorage.getItem("dbv") !== DB_CONTEXT_VERSION) {
    console.log("New DB, will refetch data");
    localStorage.removeItem("db");
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
  const raw = localStorage.getItem("db");
  const storedDb = (raw): Promise<DatabaseType> =>
    new Promise((resolve, reject) => {
      try {
        if (raw === null) {
          reject("localStorage is null");
        } else {
          const db = decompressJsonString(localStorage.getItem("db"));
          resolve({
            schemaVersion,
            versionMd5,
            updateTime: lastUpdateTime,
            holidays: db.holidays,
            routeList: db.routeList,
            stopList: db.stopList,
            stopMap: db.stopMap,
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
      try {
        const db = await storedDb(raw);
        return db;
      } catch {}
    }
  }

  try {
    const [_schemaVersion, _md5] = await Promise.all([
      fetch(process.env.PUBLIC_URL + "/schema-version.txt").then((res) =>
        res.text()
      ),
      fetchEtaObjMd5(),
    ]);
    let needRenew = forceRenew;
    if (schemaVersion !== _schemaVersion) {
      needRenew = true;
    }
    if (versionMd5 !== _md5) {
      needRenew = true;
    }
    try {
      if (!needRenew) {
        const db = await storedDb(raw);
        if (isBusDb(db)) {
          return db;
        }
      }
    } catch {}
    const updateTime = Date.now() + "";
    localStorage.setItem("updateTime", updateTime);
    return new Promise((resolve_1) => {
      const timerId = setTimeout(() => {
        if (!forceRenew && raw !== null) {
          const _cachedDb = storedDb(raw);
          if (isBusDb(_cachedDb)) {
            resolve_1(_cachedDb);
          }
        }
      }, 1000);
      fetchEtaObj()
        .then((db_1) => ({
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
    };
  }
};
