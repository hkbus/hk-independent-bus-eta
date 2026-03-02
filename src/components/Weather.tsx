import { useEffect, useState } from "react";

type Warning = {
  name: string;
  code: WeatherCode;
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

    const fetchData = async () => {
      if (navigator.userAgent === "prerendering") {
        // skip if prerendering
        setWeather({});
        return new Promise((resolve) => resolve([]));
      }
      return fetch(
        "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en"
      )
        .then((res) => res.json())
        .then((data) => {
          if (isMounted) setWeather(data);
        });
    };

    const fetchEtaInterval = setInterval(() => {
      fetchData();
    }, 60000);

    fetchData();

    // testing
    //
    // setWeather({
    //   WFIRE: {
    //     code: "WFIRER",
    //     actionCode: "ISSUE",
    //   }
    // } as Weather);

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
    .filter(({ actionCode }) => actionCode !== "CANCEL")
    .map(({ code }) => code)
    .filter((code) => CODE_ORDER.indexOf(code) >= 0)
    .sort((a, b) => (CODE_ORDER.indexOf(a) < CODE_ORDER.indexOf(b) ? -1 : 1));
};

const CODE_ORDER: WeatherCode[] = [
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
  "WFROST",
  "WL",
  "WTMW",
  "WTS",
  "WFNTSA",
  "WFIRER",
  "WFIREY",
  "WHOT",
  "WCOLD",
  "WMSGNL",
];

export const WeatherIcons: Partial<Record<WeatherCode, string>> = (() => {
  const icons: Partial<Record<WeatherCode, string>> = {};
  for (const code of CODE_ORDER) {
    icons[code] = `https://www.metwarn.hk/img/hko_warning_icon/${code}.png`;
  }
  return icons;
})();

export type WeatherCode =
  | "TC10"
  | "TC9"
  | "TC8SW"
  | "TC8NW"
  | "TC8SE"
  | "TC8NE"
  | "WRAINB"
  | "WRAINR"
  | "TC3"
  | "TC1"
  | "WRAINA"
  | "WFROST"
  | "WL"
  | "WTMW"
  | "WTS"
  | "WFNTSA"
  | "WFIRER"
  | "WFIREY"
  | "WHOT"
  | "WCOLD"
  | "WMSGNL";
