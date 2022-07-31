import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import RouteEta from "../../../src/pages/RouteEta";
import type { BusDb } from "hk-bus-eta";
import type {
  RouteListEntry,
  Company,
  StopMap,
  StopListEntry,
} from "hk-bus-eta";
import { getI18nPaths, getI18nProps } from "../../../util/getStatic";
import { useState } from "react";
import React from "react";
interface Param {
  routeId: string;
  routeListEntry: RouteListEntry;
  stopsExtracted: StopListEntry[];
  dialogStop: string[][];
  panel?: number;
}
const RouteEtaContainer: NextPage<Param> = (props) => {
  const [panel, setPanel] = useState<number | undefined>(props.panel);
  return <RouteEta {...props} panel={panel} setPanel={setPanel} />;
};

export default RouteEtaContainer;

// TODO: better handling on buggy data in database
const getStops = (co: Company[], stops: RouteListEntry["stops"]): string[] => {
  for (let i = 0; i < co.length; ++i) {
    if (co[i] in stops) {
      return stops[co[i]];
    }
  }
  return [];
};

// TODO: better handling on buggy data in database
const getDialogStops = (
  co: Company[],
  stops: RouteListEntry["stops"],
  stopMap: StopMap,
  panel: number
): string[][] => {
  for (let i = 0; i < co.length; ++i) {
    if (co[i] in stops) {
      return [[co[i], stops[co[i]][panel]]].concat(
        stopMap[stops[co[i]][panel]] || []
      );
    }
  }
  return [];
};

let cache: null | BusDb = null;

const getBusDb = async () => {
  if (cache == null) {
    const resp = await fetch(
      "https://hkbus.github.io/hk-bus-crawling/routeFareList.min.json"
    );
    const routes = (await resp.json()) as BusDb;
    cache = {
      ...routes,
      routeList: Object.fromEntries(
        Object.entries(routes.routeList).map(([key, value]) => {
          return [
            key
              .replace(/\+/g, "-")
              .replace(/ /g, "-")
              .replace(/\:/g, "-")
              .toLowerCase(),
            value,
          ];
        })
      ),
    };
    return cache;
  } else {
    return cache;
  }
};

export const getStaticProps: GetStaticProps = async (context) => {
  const routes = await getBusDb();
  const localProps = await getI18nProps(context);
  const { routeList, stopList, stopMap } = routes;
  const id = (context.params?.id ?? []) as string;
  const routeId = id;
  if (!(routeId in routeList)) {
    console.log("id not found!", id);
    return {
      notFound: true,
    };
  }
  const routeListEntry = routeList[routeId];
  const { stops, co } = routeListEntry;
  const stopsExtracted = getStops(co, stops)
    .map((id) => {
      return stopList[id];
    })
    .filter((stop) => stop !== null && stop !== undefined);
  const dialogStop = getDialogStops(co, stops, stopMap, 0);
  return {
    props: {
      routeId,
      routeListEntry,
      stopsExtracted,
      dialogStop,
      ...localProps,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const { routeList, stopList } = await getBusDb();
  return {
    paths: getI18nPaths().flatMap((paths) => {
      return Object.entries(routeList).flatMap(([route]) => {
        return [
          {
            params: { id: route, ...paths.params },
          },
        ];
      });
    }),
    fallback: false,
  };
};
