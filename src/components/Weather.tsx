import { useEffect, useState } from "react";

type Warning = {
  name: string;
  code: string;
  actionCode: "ISSUE" | "REISSUE" | "CANCEL" | "EXTEND" | "UPDATE";
  issueTime: string;
  expireTime: string | null;
  updateTime: string;
};

export type Weather = {
  WFIRE?: Warning;
  WFROST?: Warning;
  WHOT?: Warning;
  WCOLD?: Warning;
  WMSGNL?: Warning;
  WRAIN?: Warning;
  WFNTSA?: Warning;
  WL?: Warning;
  WTCSGNL?: Warning;
  WTMW?: Warning;
  WTS?: Warning;
};

export const useWeather = () => {
  const [weather, setWeather] = useState<Weather>({});

  useEffect(() => {
    let isMounted = true;

    const fetchData = () => {
      if (navigator.userAgent === "prerendering") {
        // skip if prerendering
        setWeather({});
        return new Promise((resolve) => resolve([]));
      }
      return fetch(
        "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en"
      )
        .then((r) => r.json())
        .then((d) => setWeather(d));
    };

    const fetchEtaInterval = setInterval(() => {
      fetchData();
    }, 30000);

    fetchData();

    return () => {
      isMounted = false;
      clearInterval(fetchEtaInterval);
    };
  }, [setWeather]);

  return weather;
};

export const useWeatherCode = () => {
  const weather = useWeather();
  return Object.values(weather)
    .map(({ code }) => code)
    .filter((code) => CODE_ORDER.indexOf(code) >= 0)
    .sort((a, b) => (CODE_ORDER.indexOf(a) < CODE_ORDER.indexOf(b) ? -1 : 1));
};

// no copyright to use HKO image
const CODE_ORDER = [
  "TC10",
  "TC9",
  "TC8SW",
  "TC8NW",
  "TC8SE",
  "TC8NE",
  "WRAINB",
  "WRAINR",
  "TC3",
  "TC1",
  "WRAINA",
  // "WFROST",
  "WL",
  // "WTMW",
  "WTS",
  "WFNTSA",
  // "WFIRER",
  // "WFIREY",
  "WHOT",
  "WCOLD",
  "WMSGNL",
];

// no copyright to use HKO image
export const WeatherIcons = {
  TC10: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/No._10_Hurricane_Signal.png/30px-No._10_Hurricane_Signal.png",
  TC9: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/No._09_Increasing_Gale_or_Storm_Signal.png/30px-No._09_Increasing_Gale_or_Storm_Signal.png",
  TC8SW:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/No._8_Southwest_Gale_or_Storm_Signal.png/30px-No._8_Southwest_Gale_or_Storm_Signal.png",
  TC8NW:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/No._8_Northwest_Gale_or_Storm_Signal.png/30px-No._8_Northwest_Gale_or_Storm_Signal.png",
  TC8SE:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/No._8_Southeast_Gale_or_Storm_Signal.png/30px-No._8_Southeast_Gale_or_Storm_Signal.png",
  TC8NE:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/No._8_Northeast_Gale_or_Storm_Signal.png/30px-No._8_Northeast_Gale_or_Storm_Signal.png",
  WRAINB:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Black_Rainstorm_Signal.png/25px-Black_Rainstorm_Signal.png",
  WRAINR:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Red_Rainstorm_Signal.png/25px-Red_Rainstorm_Signal.png",
  TC3: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/No._03_Strong_Wind_Signal.png/30px-No._03_Strong_Wind_Signal.png",
  TC1: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/No._01_Standby_Signal.png/30px-No._01_Standby_Signal.png",
  WRAINA:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Amber_Rainstorm_Signal.png/25px-Amber_Rainstorm_Signal.png",
  // WFROST: "https://www.hko.gov.hk/tc/textonly/img/warn/images/frost.gif",
  WL: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Landslip.gif/25px-Landslip.gif",
  // WTMW: "https://www.hko.gov.hk/tc/textonly/img/warn/images/tsunami-warn.gif",
  WTS: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Thunderstorm_Warning.png/25px-Thunderstorm_Warning.png",
  WFNTSA:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Ntfl.gif/25px-Ntfl.gif",
  // WFIRER: "https://www.hko.gov.hk/tc/textonly/img/warn/images/firer.gif",
  // WFIREY: "https://www.hko.gov.hk/tc/textonly/img/warn/images/firey.gif",
  WHOT: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Very_Hot_Weather_Warning.png/25px-Very_Hot_Weather_Warning.png",
  WCOLD:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Cold_Weather_Warning.png/25px-Cold_Weather_Warning.png",
  WMSGNL:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/HK_Monsoon_Signal.png/25px-HK_Monsoon_Signal.png",
};

const TEST = {
  WFROST: {
    name: "霜凍警告",
    code: "WFROST",
    actionCode: "ISSUE",
    issueTime: "2020-09-24T11:15:00+08:00",
    updateTime: "2020-09-24T11:15:00+08:00",
  },
  WHOT: {
    name: "酷熱天氣警告",
    code: "WHOT",
    actionCode: "ISSUE",
    issueTime: "2020-09-24T07:00:00+08:00",
    updateTime: "2020-09-24T07:00:00+08:00",
  },
  WCOLD: {
    name: "寒冷天氣警告",
    code: "WCOLD",
    actionCode: "ISSUE",
    issueTime: "2020-09-24T11:15:00+08:00",
    updateTime: "2020-09-24T11:15:00+08:00",
  },
  WFNTSA: {
    name: "新界北部水浸特別報告",
    code: "WFNTSA",
    actionCode: "ISSUE",
    issueTime: "2020-09-24T11:40:00+08:00",
    updateTime: "2020-09-24T11:40:00+08:00",
  },
  WMSGNL: {
    name: "強烈季候風信號",
    code: "WMSGNL",
    actionCode: "ISSUE",
    issueTime: "2020-09-24T11:15:00+08:00",
    updateTime: "2020-09-24T11:15:00+08:00",
  },
  WL: {
    name: "山泥傾瀉警告",
    code: "WL",
    actionCode: "ISSUE",
    issueTime: "2020-09-24T11:15:00+08:00",
    updateTime: "2020-09-24T11:15:00+08:00",
  },
  WRAIN: {
    name: "暴雨警告信號",
    code: "WRAINB",
    type: "紅色",
    actionCode: "ISSUE",
    issueTime: "2020-09-24T11:15:00+08:00",
    updateTime: "2020-09-24T11:15:00+08:00",
  },
  WTMW: {
    name: "海嘯警告",
    code: "WTMW",
    actionCode: "ISSUE",
    issueTime: "2020-09-24T11:15:00+08:00",
    updateTime: "2020-09-24T11:15:00+08:00",
  },
  WTS: {
    name: "雷暴警告",
    code: "WTS",
    actionCode: "EXTEND",
    issueTime: "2020-09-24T11:40:00+08:00",
    expireTime: "2020-09-24T19:30:00+08:00",
    updateTime: "2020-09-24T05:00:00+08:00",
  },
  WTCSGNL: {
    name: "熱帶氣旋警告信號",
    code: "TC3",
    actionCode: "ISSUE",
    type: "三號強風信號",
    issueTime: "2020-09-24T11:15:00+08:00",
    updateTime: "2020-09-24T11:15:00+08:00",
  },
  WFIRE: {
    name: "火災危險警告",
    code: "WFIRER",
    type: "紅色",
    actionCode: "ISSUE",
    issueTime: "2020-09-24T11:15:00+08:00",
    updateTime: "2020-09-24T11:15:00+08:00",
  },
};
