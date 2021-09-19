import { fetchEtaObj, fetchEtaObjMd5 } from "hk-bus-eta";
import { decompress as decompressJson } from "lzutf8";
import { decompress as _decompressJson } from "compressed-json";

// implant the DB Context logic into code to avoid loading error
export const DB_CONTEXT_VERSION = "1.1.0";

const decompressJsonString = (txt) => {
  try {
    const ret = JSON.parse(decompressJson(txt, { inputEncoding: "Base64" }));
    return {
      ...ret,
      // sort the routeList object order based on the key
      routeList: Object.keys(ret.routeList)
        .sort()
        .reduce((acc, k) => {
          acc[k.replace(/\+/g, "-").replace(/ /g, "-").toUpperCase()] =
            ret.routeList[k];
          return acc;
        }, {}),
    };
  } catch (e) {
    try {
      // backward compactability
      return _decompressJson(JSON.parse(txt));
    } catch (e2) {
      // return empty object if no valid JSON string parsed
      return { routeList: {}, stopList: {}, stopMap: {} };
    }
  }
};

// to optimize the data fetching significantly
// we define the fetchDbFunc outside the components
// and we hence able to fetch data before rendering
/**
 *
 * @param {boolean} forceRenew
 * @returns {Promise<{
 *   routeList: Record<string, import("hk-bus-eta").RouteListEntry>;
 *   stopList: Record<string, import("hk-bus-eta").StopListEntry>;
 *   stopMap: Record<string, import("hk-bus-eta").StopMapEntry>;
 *   versionMd5: string,
 *   schemaVersion: string,
 *   updateTime: number
 * }>}
 */
export const fetchDbFunc = async (forceRenew = false) => {
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
    localStorage.getItem("updateTime") || Date.now(),
    10
  );
  const storedDb = new Promise((resolve, reject) => {
    try {
      const db = decompressJsonString(localStorage.getItem("db"));
      resolve({
        schemaVersion,
        versionMd5,
        updateTime: lastUpdateTime,
        routeList: db.routeList,
        stopList: db.stopList,
        stopMap: db.stopMap,
      });
    } catch (e) {
      reject(e);
    }
  });

  if (
    localStorage.getItem("db") &&
    (!navigator.onLine ||
      (!forceRenew && Date.now() - lastUpdateTime < 7 * 24 * 3600 * 1000))
  ) {
    try {
      const db = await storedDb;
      return db;
    } catch {}
  }

  try {
    const [_schemaVersion, _md5] = await Promise.all([
      fetch(process.env.PUBLIC_URL + "/schema-version.txt").then((r) =>
        r.text()
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
        const db = await storedDb;
        return db;
      }
    } catch {}
    const updateTime = Date.now();
    localStorage.setItem("updateTime", Date.now());
    return new Promise((resolve_1) => {
      const timerId = setTimeout(() => {
        if (!forceRenew && localStorage.getItem("db")) {
          resolve_1(storedDb);
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
      routeList: {},
      stopList: {},
      stopMap: {},
    };
  }
};
