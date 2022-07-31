/* eslint-env serviceworker */
/* eslint-disable no-restricted-globals */

import { fetchEtaObj } from "hk-bus-eta";
import { getTileListURL, isWarnUpMessageData } from "../src/utils";
import type { StopListEntry } from "hk-bus-eta";

declare var self: ServiceWorkerGlobalScope & typeof globalThis;

const warnUpCache = async (
  zoomLevels: Array<number>,
  event: ExtendableEvent,
  retina: boolean,
  stopListInput?: Array<StopListEntry>
) => {
  try {
    let stopList: StopListEntry[];
    if (stopListInput === undefined) {
      const eta = await fetchEtaObj();
      stopList = Object.values(eta.stopList);
    } else {
      stopList = stopListInput;
    }
    const cache = await caches.open("map");
    await Promise.all(
      zoomLevels.map(async (i) => {
        const list = getTileListURL(i, stopList, retina);
        const generate = async (offset: number, base) => {
          for (let k = offset; k < list.length; k = k + base) {
            const c = await cache.match(list[k]);
            if (c === undefined) {
              await cache.add(list[k]);
            }
          }
        };
        let promises: Promise<unknown>[] = [];
        for (let i = 0; i < 10; i = i + 1) {
          promises.push(generate(i, 10));
        }
        await Promise.all(promises);
        return;
      })
    );
  } catch (e) {
    console.error("error on warn cache", e);
  }
};

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CHECK_VERSION") {
    const CIJobID =
      process.env.NEXT_PUBLIC_CI_JOB_ID !== undefined
        ? process.env.NEXT_PUBLIC_CI_JOB_ID
        : "1";
    self.clients
      .matchAll({ includeUncontrolled: true, type: "window" })
      .then((all) =>
        all.map((client) =>
          client.postMessage({
            type: "CURRENT_VERSION",
            payload: `build ${CIJobID}`,
          })
        )
      );
  }
  const data: unknown = event.data;
  if (isWarnUpMessageData(data)) {
    console.log("warm up map cache", data);
    const warnCache = async () => {
      try {
        await warnUpCache(
          data.zoomLevels,
          event,
          data.retinaDisplay,
          data.stopList
        );
      } catch (e) {
        console.error("error on warn cache", e);
      }
    };
    event.waitUntil(warnCache());
  }
});
