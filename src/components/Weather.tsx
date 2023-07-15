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
        .then((res) => res.json())
        .then((data) => {
          if (isMounted) setWeather(data);
        });
    };

    const fetchEtaInterval = setInterval(() => {
      fetchData();
    }, 300000);

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
