import type { StopListEntry } from "hk-bus-eta";
import type { Location as GeoLocation } from "hk-bus-eta";
import type { WarnUpMessageData } from "./typing";
export const getDistance = (a: GeoLocation, b: GeoLocation) => {
  const R = 6371e3; // metres
  const φ1 = (a.lat * Math.PI) / 180; // φ, λ in radians
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;

  const aa =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return R * c; // in metres
};

export const getDistanceWithUnit = (a: GeoLocation, b: GeoLocation) => {
  const distanceInMetre = getDistance(a, b);
  if (distanceInMetre >= 1000) {
    return {
      distance: distanceInMetre / 1000,
      unit: "公里",
      decimalPlace: 1,
    };
  }
  return {
    distance: distanceInMetre,
    unit: "米",
    decimalPlace: 0,
  };
};

const defaultLocation = { lat: 22.302711, lng: 114.177216 };
// HK location if no valid value
export const checkPosition = (position?: GeoLocation): GeoLocation => {
  if (
    position &&
    typeof position.lat === "number" &&
    isFinite(position.lat) &&
    typeof position.lng === "number" &&
    isFinite(position.lng)
  ) {
    return position;
  } else {
    return defaultLocation;
  }
};

const locationEpsilon = 0.0000001;
export const locationEqual = (
  position1: GeoLocation,
  position2: GeoLocation
): boolean => {
  return (
    Math.abs(position1.lat - position2.lat) < locationEpsilon &&
    Math.abs(position1.lng - position2.lng) < locationEpsilon
  );
};

export const checkMobile = () => {
  let check = false;
  //eslint-disable-next-line
  (function (a) {
    if (
      //eslint-disable-next-line
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      //eslint-disable-next-line
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window["opera"]);
  return check;
};

export const vibrate = (duration: number) => {
  if ("vibrate" in navigator) {
    navigator.vibrate(duration);
  }
};

export const triggerShare = (url: string, title: string) => {
  if (navigator.share) {
    return navigator.share({ title, url });
  } else if (navigator.clipboard) {
    return navigator.clipboard.writeText(url);
  }
  return new Promise((resolve) => resolve(""));
};

export const triggerShareImg = async (
  base64Img: string,
  title: string,
  text: string
) => {
  const blob = await fetch(base64Img).then((res) => res.blob());
  const file = new File([blob], "hkbus.png", { type: blob.type });
  if (navigator.share) {
    return navigator.share({
      title: title,
      text: text,
      files: [file],
    });
  } else if (navigator.clipboard) {
    return navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob }),
    ]);
  }
};

export const setSeoHeader = ({
  title,
  description,
  lang,
}: {
  title: string;
  description: string;
  lang: string;
}) => {
  if (!document.querySelector('meta[name="description"]')) {
    // skip if rendering not ready
    return;
  }
  // basic SEO
  document.title = title;
  document
    .querySelector('meta[name="description"]')
    .setAttribute("content", description);
  document
    .querySelector('link[rel="canonical"]')
    .setAttribute("href", `https://hkbus.app${window.location.pathname}`);
  // language related meta tag
  document
    .querySelector("html")
    .setAttribute("lang", lang === "zh" ? "zh-Hant" : lang);
  document
    .querySelector('link[rel="alternative"][hreflang="en"]')
    .setAttribute(
      "href",
      "https://hkbus.app" + window.location.pathname.replace(`/${lang}`, "/en")
    );
  document
    .querySelector('link[rel="alternative"][hreflang="zh-Hant"]')
    .setAttribute(
      "href",
      "https://hkbus.app" + window.location.pathname.replace(`/${lang}`, "/zh")
    );
  document
    .querySelector('link[rel="alternative"][hreflang="x-default"]')
    .setAttribute(
      "href",
      "https://hkbus.app" + window.location.pathname.replace(`/${lang}`, "/zh")
    );
  // facebook
  document
    .querySelector('meta[property="og:title"]')
    .setAttribute("content", title);
  document
    .querySelector('meta[property="og:url"]')
    .setAttribute("content", `https://hkbus.app${window.location.pathname}`);
  document
    .querySelector('meta[property="og:description"]')
    .setAttribute("content", description);
  // twitter card
  document
    .querySelector('meta[name="twitter:title"]')
    .setAttribute("content", title);
  document
    .querySelector('meta[name="twitter:description"]')
    .setAttribute("content", description);
};

export const toProperCase = (txt: string) => {
  return txt.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const isEmptyObj = (obj: unknown) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

export function lon2tile(lon: number, zoom: number) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}
export function lat2tile(lat: number, zoom: number) {
  return Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );
}

export const binarySearch = <T>(
  ar: T[],
  el: T,
  compare_fn: (a: T, b: T) => number
) => {
  let m = 0;
  let n = ar.length - 1;
  while (m <= n) {
    let k = (n + m) >> 1;
    let cmp = compare_fn(el, ar[k]);
    if (cmp > 0) {
      m = k + 1;
    } else if (cmp < 0) {
      n = k - 1;
    } else {
      return k;
    }
  }
  return -m - 1;
};

interface TempEntry {
  key: number;
  x: number;
  y: number;
}

export const getTileListURL = (
  zoomLevel: number,
  stopLists: Array<StopListEntry>,
  retinaDisplay: boolean
) => {
  const high = 255 * (zoomLevel + 5) * (zoomLevel + 5);
  const compare = (a: TempEntry, b: TempEntry) => b.key - a.key;
  return stopLists
    .map((stop) => {
      const x = lon2tile(stop.location.lng, zoomLevel);
      const y = lat2tile(stop.location.lat, zoomLevel);
      return {
        key: x * high + y,
        x: x,
        y: y,
      };
    })
    .sort(compare)
    .reduce((prev: TempEntry[], curr) => {
      if (binarySearch(prev, curr, compare) < 0) {
        prev.push(curr);
      }
      return prev;
    }, [])
    .flatMap((entry) => [
      process.env.REACT_APP_OSM_PROVIDER_URL.replace(/\{s\}/g, "a")
        .replace(/\{x\}/g, String(entry.x))
        .replace(/\{y\}/g, String(entry.y))
        .replace(/\{z\}/g, String(zoomLevel))
        .replace(/\{r\}/g, retinaDisplay ? "@2x" : ""),
      process.env.REACT_APP_OSM_PROVIDER_URL_DARK.replace(/\{s\}/g, "a")
        .replace(/\{x\}/g, String(entry.x))
        .replace(/\{y\}/g, String(entry.y))
        .replace(/\{z\}/g, String(zoomLevel))
        .replace(/\{r\}/g, retinaDisplay ? "@2x" : ""),
    ]);
};

export const isWarnUpMessageData = (
  value: unknown
): value is WarnUpMessageData => {
  return typeof value === "object" && value["type"] === "WARN_UP_MAP_CACHE";
};

export const checkAppInstalled = () => {
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  // @ts-ignore
  const standalone = window.navigator.standalone;
  const userAgent = window.navigator.userAgent.toLowerCase();
  const safari = /safari/.test(userAgent);
  const ios = /iphone|ipod|ipad/.test(userAgent);

  if (ios) {
    if (!standalone && safari) {
      // Safari
    } else if (!standalone && !safari) {
      // iOS webview
      return true;
    }
  } else {
    if (userAgent.includes("wv")) {
      // Android webview
      return true;
    } else {
      // Chrome
    }
  }
  return false;
};

export const reorder = <T>(
  list: T[],
  startIndex: number,
  endIndex: number
): T[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export const routeSortFunc = (a, b, transportOrder: string[]) => {
  const aRoute = a[0].split("-");
  const bRoute = b[0].split("-");

  // Exclude A-Z from end of strings, smaller number should come first
  if (parseInt(aRoute[0], 10) > parseInt(bRoute[0], 10)) {
    return 1;
  } else if (parseInt(aRoute[0], 10) < parseInt(bRoute[0], 10)) {
    return -1;
  }

  // Exclude numbers, smaller alphabet should come first
  if (aRoute[0].replace(/[0-9]/gi, "") > bRoute[0].replace(/[0-9]/gi, "")) {
    return 1;
  } else if (
    aRoute[0].replace(/[0-9]/gi, "") < bRoute[0].replace(/[0-9]/gi, "")
  ) {
    return -1;
  }

  // Remove all A-Z, smaller number should come first
  if (parseInt(aRoute[0], 10) > parseInt(bRoute[0], 10)) {
    return 1;
  } else if (parseInt(aRoute[0], 10) < parseInt(bRoute[0], 10)) {
    return -1;
  }

  // Sort by TRANSPORT_ORDER
  const aCompany = a[1]["co"].sort(
    (a, b) => transportOrder.indexOf(a) - transportOrder.indexOf(b)
  );
  const bCompany = b[1]["co"].sort(
    (a, b) => transportOrder.indexOf(a) - transportOrder.indexOf(b)
  );

  if (
    transportOrder.indexOf(aCompany[0]) > transportOrder.indexOf(bCompany[0])
  ) {
    return 1;
  } else if (
    transportOrder.indexOf(aCompany[0]) < transportOrder.indexOf(bCompany[0])
  ) {
    return -1;
  }

  // Smaller service Type should come first
  return aRoute[1] > bRoute[1] ? 1 : -1;
};

export const iOSRNWebView = (): boolean => {
  // @ts-ignore
  return window.iOSRNWebView;
};

export const iOSTracking = (): boolean => {
  // @ts-ignore
  return window.iOSTracking;
};

export const isStrings = (input: unknown[]): input is string[] => {
  if (input.some((v) => typeof v !== "string")) {
    return false;
  }
  return true;
};

export const ServiceDayMap: Record<
  string,
  [0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1, 0 | 1]
> = {
  "1": [0, 1, 0, 0, 0, 0, 0],
  "2": [0, 0, 1, 0, 0, 0, 0],
  "3": [0, 1, 1, 0, 0, 0, 0],
  "4": [0, 0, 0, 1, 0, 0, 0],
  "5": [0, 1, 0, 1, 0, 0, 0],
  "6": [0, 0, 1, 1, 0, 0, 0],
  "7": [0, 1, 1, 1, 0, 0, 0],
  "8": [0, 0, 0, 0, 1, 0, 0],
  "9": [0, 1, 0, 0, 1, 0, 0],
  "10": [0, 0, 1, 0, 1, 0, 0],
  "11": [0, 1, 1, 0, 1, 0, 0],
  "12": [0, 0, 0, 1, 1, 0, 0],
  "13": [0, 1, 0, 1, 1, 0, 0],
  "14": [0, 0, 1, 1, 1, 0, 0],
  "15": [0, 1, 1, 1, 1, 0, 0],
  "16": [0, 0, 0, 0, 0, 1, 0],
  "17": [0, 1, 0, 0, 0, 1, 0],
  "18": [0, 0, 1, 0, 0, 1, 0],
  "19": [0, 1, 1, 0, 0, 1, 0],
  "20": [0, 0, 0, 1, 0, 1, 0],
  "21": [0, 1, 0, 1, 0, 1, 0],
  "22": [0, 0, 1, 1, 0, 1, 0],
  "23": [0, 1, 1, 1, 0, 1, 0],
  "24": [0, 0, 0, 0, 1, 1, 0],
  "25": [0, 1, 0, 0, 1, 1, 0],
  "26": [0, 0, 1, 0, 1, 1, 0],
  "27": [0, 1, 1, 0, 1, 1, 0],
  "28": [0, 0, 0, 1, 1, 1, 0],
  "29": [0, 1, 0, 1, 1, 1, 0],
  "30": [0, 0, 1, 1, 1, 1, 0],
  "31": [0, 1, 1, 1, 1, 1, 0],
  "32": [0, 0, 0, 0, 0, 0, 1],
  "33": [0, 1, 0, 0, 0, 0, 1],
  "34": [0, 0, 1, 0, 0, 0, 1],
  "35": [0, 1, 1, 0, 0, 0, 1],
  "36": [0, 0, 0, 1, 0, 0, 1],
  "37": [0, 1, 0, 1, 0, 0, 1],
  "38": [0, 0, 1, 1, 0, 0, 1],
  "39": [0, 1, 1, 1, 0, 0, 1],
  "40": [0, 0, 0, 0, 1, 0, 1],
  "41": [0, 1, 0, 0, 1, 0, 1],
  "42": [0, 0, 1, 0, 1, 0, 1],
  "43": [0, 1, 1, 0, 1, 0, 1],
  "44": [0, 0, 0, 1, 1, 0, 1],
  "45": [0, 1, 0, 1, 1, 0, 1],
  "46": [0, 0, 1, 1, 1, 0, 1],
  "47": [0, 1, 1, 1, 1, 0, 1],
  "48": [0, 0, 0, 0, 0, 1, 1],
  "49": [0, 1, 0, 0, 0, 1, 1],
  "50": [0, 0, 1, 0, 0, 1, 1],
  "51": [0, 1, 1, 0, 0, 1, 1],
  "52": [0, 0, 0, 1, 0, 1, 1],
  "53": [0, 1, 0, 1, 0, 1, 1],
  "54": [0, 0, 1, 1, 0, 1, 1],
  "55": [0, 1, 1, 1, 0, 1, 1],
  "56": [0, 0, 0, 0, 1, 1, 1],
  "57": [0, 1, 0, 0, 1, 1, 1],
  "58": [0, 0, 1, 0, 1, 1, 1],
  "59": [0, 1, 1, 0, 1, 1, 1],
  "60": [0, 0, 0, 1, 1, 1, 1],
  "61": [0, 1, 0, 1, 1, 1, 1],
  "62": [0, 0, 1, 1, 1, 1, 1],
  "63": [0, 1, 1, 1, 1, 1, 1],
  "64": [1, 0, 0, 0, 0, 0, 0],
  "65": [1, 1, 0, 0, 0, 0, 0],
  "66": [1, 0, 1, 0, 0, 0, 0],
  "67": [1, 1, 1, 0, 0, 0, 0],
  "68": [1, 0, 0, 1, 0, 0, 0],
  "69": [1, 1, 0, 1, 0, 0, 0],
  "70": [1, 0, 1, 1, 0, 0, 0],
  "71": [1, 1, 1, 1, 0, 0, 0],
  "72": [1, 0, 0, 0, 1, 0, 0],
  "73": [1, 1, 0, 0, 1, 0, 0],
  "74": [1, 0, 1, 0, 1, 0, 0],
  "75": [1, 1, 1, 0, 1, 0, 0],
  "76": [1, 0, 0, 1, 1, 0, 0],
  "77": [1, 1, 0, 1, 1, 0, 0],
  "78": [1, 0, 1, 1, 1, 0, 0],
  "79": [1, 1, 1, 1, 1, 0, 0],
  "80": [1, 0, 0, 0, 0, 1, 0],
  "81": [1, 1, 0, 0, 0, 1, 0],
  "82": [1, 0, 1, 0, 0, 1, 0],
  "83": [1, 1, 1, 0, 0, 1, 0],
  "84": [1, 0, 0, 1, 0, 1, 0],
  "85": [1, 1, 0, 1, 0, 1, 0],
  "86": [1, 0, 1, 1, 0, 1, 0],
  "87": [1, 1, 1, 1, 0, 1, 0],
  "88": [1, 0, 0, 0, 1, 1, 0],
  "89": [1, 1, 0, 0, 1, 1, 0],
  "90": [1, 0, 1, 0, 1, 1, 0],
  "91": [1, 1, 1, 0, 1, 1, 0],
  "92": [1, 0, 0, 1, 1, 1, 0],
  "93": [1, 1, 0, 1, 1, 1, 0],
  "94": [1, 0, 1, 1, 1, 1, 0],
  "95": [1, 1, 1, 1, 1, 1, 0],
  "96": [1, 0, 0, 0, 0, 0, 1],
  "97": [1, 1, 0, 0, 0, 0, 1],
  "98": [1, 0, 1, 0, 0, 0, 1],
  "99": [1, 1, 1, 0, 0, 0, 1],
  "100": [1, 0, 0, 1, 0, 0, 1],
  "101": [1, 1, 0, 1, 0, 0, 1],
  "102": [1, 0, 1, 1, 0, 0, 1],
  "103": [1, 1, 1, 1, 0, 0, 1],
  "104": [1, 0, 0, 0, 1, 0, 1],
  "105": [1, 1, 0, 0, 1, 0, 1],
  "106": [1, 0, 1, 0, 1, 0, 1],
  "107": [1, 1, 1, 0, 1, 0, 1],
  "108": [1, 0, 0, 1, 1, 0, 1],
  "109": [1, 1, 0, 1, 1, 0, 1],
  "110": [1, 0, 1, 1, 1, 0, 1],
  "111": [1, 1, 1, 1, 1, 0, 1],
  "112": [1, 0, 0, 0, 0, 1, 1],
  "113": [1, 1, 0, 0, 0, 1, 1],
  "114": [1, 0, 1, 0, 0, 1, 1],
  "115": [1, 1, 1, 0, 0, 1, 1],
  "116": [1, 0, 0, 1, 0, 1, 1],
  "117": [1, 1, 0, 1, 0, 1, 1],
  "118": [1, 0, 1, 1, 0, 1, 1],
  "119": [1, 1, 1, 1, 0, 1, 1],
  "120": [1, 0, 0, 0, 1, 1, 1],
  "121": [1, 1, 0, 0, 1, 1, 1],
  "122": [1, 0, 1, 0, 1, 1, 1],
  "123": [1, 1, 1, 0, 1, 1, 1],
  "124": [1, 0, 0, 1, 1, 1, 1],
  "125": [1, 1, 0, 1, 1, 1, 1],
  "126": [1, 0, 1, 1, 1, 1, 1],
  "127": [1, 1, 1, 1, 1, 1, 1],
  "128": [0, 0, 0, 0, 0, 0, 0],
  "129": [0, 1, 0, 0, 0, 0, 0],
  "130": [0, 0, 1, 0, 0, 0, 0],
  "131": [0, 1, 1, 0, 0, 0, 0],
  "132": [0, 0, 0, 1, 0, 0, 0],
  "133": [0, 1, 0, 1, 0, 0, 0],
  "134": [0, 0, 1, 1, 0, 0, 0],
  "135": [0, 1, 1, 1, 0, 0, 0],
  "136": [0, 0, 0, 0, 1, 0, 0],
  "137": [0, 1, 0, 0, 1, 0, 0],
  "138": [0, 0, 1, 0, 1, 0, 0],
  "139": [0, 1, 1, 0, 1, 0, 0],
  "140": [0, 0, 0, 1, 1, 0, 0],
  "141": [0, 1, 0, 1, 1, 0, 0],
  "142": [0, 0, 1, 1, 1, 0, 0],
  "143": [0, 1, 1, 1, 1, 0, 0],
  "144": [0, 0, 0, 0, 0, 1, 0],
  "145": [0, 1, 0, 0, 0, 1, 0],
  "146": [0, 0, 1, 0, 0, 1, 0],
  "147": [0, 1, 1, 0, 0, 1, 0],
  "148": [0, 0, 0, 1, 0, 1, 0],
  "149": [0, 1, 0, 1, 0, 1, 0],
  "150": [0, 0, 1, 1, 0, 1, 0],
  "151": [0, 1, 1, 1, 0, 1, 0],
  "152": [0, 0, 0, 0, 1, 1, 0],
  "153": [0, 1, 0, 0, 1, 1, 0],
  "154": [0, 0, 1, 0, 1, 1, 0],
  "155": [0, 1, 1, 0, 1, 1, 0],
  "156": [0, 0, 0, 1, 1, 1, 0],
  "157": [0, 1, 0, 1, 1, 1, 0],
  "158": [0, 0, 1, 1, 1, 1, 0],
  "159": [0, 1, 1, 1, 1, 1, 0],
  "160": [0, 0, 0, 0, 0, 0, 1],
  "161": [0, 1, 0, 0, 0, 0, 1],
  "162": [0, 0, 1, 0, 0, 0, 1],
  "163": [0, 1, 1, 0, 0, 0, 1],
  "164": [0, 0, 0, 1, 0, 0, 1],
  "165": [0, 1, 0, 1, 0, 0, 1],
  "166": [0, 0, 1, 1, 0, 0, 1],
  "167": [0, 1, 1, 1, 0, 0, 1],
  "168": [0, 0, 0, 0, 1, 0, 1],
  "169": [0, 1, 0, 0, 1, 0, 1],
  "170": [0, 0, 1, 0, 1, 0, 1],
  "171": [0, 1, 1, 0, 1, 0, 1],
  "172": [0, 0, 0, 1, 1, 0, 1],
  "173": [0, 1, 0, 1, 1, 0, 1],
  "174": [0, 0, 1, 1, 1, 0, 1],
  "175": [0, 1, 1, 1, 1, 0, 1],
  "176": [0, 0, 0, 0, 0, 1, 1],
  "177": [0, 1, 0, 0, 0, 1, 1],
  "178": [0, 0, 1, 0, 0, 1, 1],
  "179": [0, 1, 1, 0, 0, 1, 1],
  "180": [0, 0, 0, 1, 0, 1, 1],
  "181": [0, 1, 0, 1, 0, 1, 1],
  "182": [0, 0, 1, 1, 0, 1, 1],
  "183": [0, 1, 1, 1, 0, 1, 1],
  "184": [0, 0, 0, 0, 1, 1, 1],
  "185": [0, 1, 0, 0, 1, 1, 1],
  "186": [0, 0, 1, 0, 1, 1, 1],
  "187": [0, 1, 1, 0, 1, 1, 1],
  "188": [0, 0, 0, 1, 1, 1, 1],
  "189": [0, 1, 0, 1, 1, 1, 1],
  "190": [0, 0, 1, 1, 1, 1, 1],
  "191": [0, 1, 1, 1, 1, 1, 1],
  "192": [1, 0, 0, 0, 0, 0, 0],
  "193": [1, 1, 0, 0, 0, 0, 0],
  "194": [1, 0, 1, 0, 0, 0, 0],
  "195": [1, 1, 1, 0, 0, 0, 0],
  "196": [1, 0, 0, 1, 0, 0, 0],
  "197": [1, 1, 0, 1, 0, 0, 0],
  "198": [1, 0, 1, 1, 0, 0, 0],
  "199": [1, 1, 1, 1, 0, 0, 0],
  "200": [1, 0, 0, 0, 1, 0, 0],
  "201": [1, 1, 0, 0, 1, 0, 0],
  "202": [1, 0, 1, 0, 1, 0, 0],
  "203": [1, 1, 1, 0, 1, 0, 0],
  "204": [1, 0, 0, 1, 1, 0, 0],
  "205": [1, 1, 0, 1, 1, 0, 0],
  "206": [1, 0, 1, 1, 1, 0, 0],
  "207": [1, 1, 1, 1, 1, 0, 0],
  "208": [1, 0, 0, 0, 0, 1, 0],
  "209": [1, 1, 0, 0, 0, 1, 0],
  "210": [1, 0, 1, 0, 0, 1, 0],
  "211": [1, 1, 1, 0, 0, 1, 0],
  "212": [1, 0, 0, 1, 0, 1, 0],
  "213": [1, 1, 0, 1, 0, 1, 0],
  "214": [1, 0, 1, 1, 0, 1, 0],
  "215": [1, 1, 1, 1, 0, 1, 0],
  "216": [1, 0, 0, 0, 1, 1, 0],
  "217": [1, 1, 0, 0, 1, 1, 0],
  "218": [1, 0, 1, 0, 1, 1, 0],
  "219": [1, 1, 1, 0, 1, 1, 0],
  "220": [1, 0, 0, 1, 1, 1, 0],
  "221": [1, 1, 0, 1, 1, 1, 0],
  "222": [1, 0, 1, 1, 1, 1, 0],
  "223": [1, 1, 1, 1, 1, 1, 0],
  "224": [1, 0, 0, 0, 0, 0, 1],
  "225": [1, 1, 0, 0, 0, 0, 1],
  "226": [1, 0, 1, 0, 0, 0, 1],
  "227": [1, 1, 1, 0, 0, 0, 1],
  "228": [1, 0, 0, 1, 0, 0, 1],
  "229": [1, 1, 0, 1, 0, 0, 1],
  "230": [1, 0, 1, 1, 0, 0, 1],
  "231": [1, 1, 1, 1, 0, 0, 1],
  "232": [1, 0, 0, 0, 1, 0, 1],
  "233": [1, 1, 0, 0, 1, 0, 1],
  "234": [1, 0, 1, 0, 1, 0, 1],
  "235": [1, 1, 1, 0, 1, 0, 1],
  "236": [1, 0, 0, 1, 1, 0, 1],
  "237": [1, 1, 0, 1, 1, 0, 1],
  "238": [1, 0, 1, 1, 1, 0, 1],
  "239": [1, 1, 1, 1, 1, 0, 1],
  "240": [1, 0, 0, 0, 0, 1, 1],
  "241": [1, 1, 0, 0, 0, 1, 1],
  "242": [1, 0, 1, 0, 0, 1, 1],
  "243": [1, 1, 1, 0, 0, 1, 1],
  "244": [1, 0, 0, 1, 0, 1, 1],
  "245": [1, 1, 0, 1, 0, 1, 1],
  "246": [1, 0, 1, 1, 0, 1, 1],
  "247": [1, 1, 1, 1, 0, 1, 1],
  "248": [1, 0, 0, 0, 1, 1, 1],
  "249": [1, 1, 0, 0, 1, 1, 1],
  "250": [1, 0, 1, 0, 1, 1, 1],
  "251": [1, 1, 1, 0, 1, 1, 1],
  "252": [1, 0, 0, 1, 1, 1, 1],
  "253": [1, 1, 0, 1, 1, 1, 1],
  "254": [1, 0, 1, 1, 1, 1, 1],
  "255": [1, 1, 1, 1, 1, 1, 1],
  "256": [0, 0, 0, 0, 0, 0, 0],
  "257": [0, 1, 0, 0, 0, 0, 0],
  "258": [0, 0, 1, 0, 0, 0, 0],
  "259": [0, 1, 1, 0, 0, 0, 0],
  "260": [0, 0, 0, 1, 0, 0, 0],
  "261": [0, 1, 0, 1, 0, 0, 0],
  "262": [0, 0, 1, 1, 0, 0, 0],
  "263": [0, 1, 1, 1, 0, 0, 0],
  "264": [0, 0, 0, 0, 1, 0, 0],
  "265": [0, 1, 0, 0, 1, 0, 0],
  "266": [0, 0, 1, 0, 1, 0, 0],
  "267": [0, 1, 1, 0, 1, 0, 0],
  "268": [0, 0, 0, 1, 1, 0, 0],
  "269": [0, 1, 0, 1, 1, 0, 0],
  "270": [0, 0, 1, 1, 1, 0, 0],
  "271": [0, 1, 1, 1, 1, 0, 0],
  "272": [0, 0, 0, 0, 0, 1, 0],
  "273": [0, 1, 0, 0, 0, 1, 0],
  "274": [0, 0, 1, 0, 0, 1, 0],
  "275": [0, 1, 1, 0, 0, 1, 0],
  "276": [0, 0, 0, 1, 0, 1, 0],
  "277": [0, 1, 0, 1, 0, 1, 0],
  "278": [0, 0, 1, 1, 0, 1, 0],
  "279": [0, 1, 1, 1, 0, 1, 0],
  "280": [0, 0, 0, 0, 1, 1, 0],
  "281": [0, 1, 0, 0, 1, 1, 0],
  "282": [0, 0, 1, 0, 1, 1, 0],
  "283": [0, 1, 1, 0, 1, 1, 0],
  "284": [0, 0, 0, 1, 1, 1, 0],
  "285": [0, 1, 0, 1, 1, 1, 0],
  "286": [0, 0, 1, 1, 1, 1, 0],
  "287": [0, 1, 1, 1, 1, 1, 0],
  "288": [0, 0, 0, 0, 0, 0, 1],
  "289": [0, 1, 0, 0, 0, 0, 1],
  "290": [0, 0, 1, 0, 0, 0, 1],
  "291": [0, 1, 1, 0, 0, 0, 1],
  "292": [0, 0, 0, 1, 0, 0, 1],
  "293": [0, 1, 0, 1, 0, 0, 1],
  "294": [0, 0, 1, 1, 0, 0, 1],
  "295": [0, 1, 1, 1, 0, 0, 1],
  "296": [0, 0, 0, 0, 1, 0, 1],
  "297": [0, 1, 0, 0, 1, 0, 1],
  "298": [0, 0, 1, 0, 1, 0, 1],
  "299": [0, 1, 1, 0, 1, 0, 1],
  "300": [0, 0, 0, 1, 1, 0, 1],
  "301": [0, 1, 0, 1, 1, 0, 1],
  "302": [0, 0, 1, 1, 1, 0, 1],
  "303": [0, 1, 1, 1, 1, 0, 1],
  "304": [0, 0, 0, 0, 0, 1, 1],
  "305": [0, 1, 0, 0, 0, 1, 1],
  "306": [0, 0, 1, 0, 0, 1, 1],
  "307": [0, 1, 1, 0, 0, 1, 1],
  "308": [0, 0, 0, 1, 0, 1, 1],
  "309": [0, 1, 0, 1, 0, 1, 1],
  "310": [0, 0, 1, 1, 0, 1, 1],
  "311": [0, 1, 1, 1, 0, 1, 1],
  "312": [0, 0, 0, 0, 1, 1, 1],
  "313": [0, 1, 0, 0, 1, 1, 1],
  "314": [0, 0, 1, 0, 1, 1, 1],
  "315": [0, 1, 1, 0, 1, 1, 1],
  "316": [0, 0, 0, 1, 1, 1, 1],
  "317": [0, 1, 0, 1, 1, 1, 1],
  "318": [0, 0, 1, 1, 1, 1, 1],
  "319": [0, 1, 1, 1, 1, 1, 1],
  "320": [1, 0, 0, 0, 0, 0, 0],
  "321": [1, 1, 0, 0, 0, 0, 0],
  "322": [1, 0, 1, 0, 0, 0, 0],
  "323": [1, 1, 1, 0, 0, 0, 0],
  "324": [1, 0, 0, 1, 0, 0, 0],
  "325": [1, 1, 0, 1, 0, 0, 0],
  "326": [1, 0, 1, 1, 0, 0, 0],
  "327": [1, 1, 1, 1, 0, 0, 0],
  "328": [1, 0, 0, 0, 1, 0, 0],
  "329": [1, 1, 0, 0, 1, 0, 0],
  "330": [1, 0, 1, 0, 1, 0, 0],
  "331": [1, 1, 1, 0, 1, 0, 0],
  "332": [1, 0, 0, 1, 1, 0, 0],
  "333": [1, 1, 0, 1, 1, 0, 0],
  "334": [1, 0, 1, 1, 1, 0, 0],
  "335": [1, 1, 1, 1, 1, 0, 0],
  "336": [1, 0, 0, 0, 0, 1, 0],
  "337": [1, 1, 0, 0, 0, 1, 0],
  "338": [1, 0, 1, 0, 0, 1, 0],
  "339": [1, 1, 1, 0, 0, 1, 0],
  "340": [1, 0, 0, 1, 0, 1, 0],
  "341": [1, 1, 0, 1, 0, 1, 0],
  "342": [1, 0, 1, 1, 0, 1, 0],
  "343": [1, 1, 1, 1, 0, 1, 0],
  "344": [1, 0, 0, 0, 1, 1, 0],
  "345": [1, 1, 0, 0, 1, 1, 0],
  "346": [1, 0, 1, 0, 1, 1, 0],
  "347": [1, 1, 1, 0, 1, 1, 0],
  "348": [1, 0, 0, 1, 1, 1, 0],
  "349": [1, 1, 0, 1, 1, 1, 0],
  "350": [1, 0, 1, 1, 1, 1, 0],
  "351": [1, 1, 1, 1, 1, 1, 0],
  "352": [1, 0, 0, 0, 0, 0, 1],
  "353": [1, 1, 0, 0, 0, 0, 1],
  "354": [1, 0, 1, 0, 0, 0, 1],
  "355": [1, 1, 1, 0, 0, 0, 1],
  "356": [1, 0, 0, 1, 0, 0, 1],
  "357": [1, 1, 0, 1, 0, 0, 1],
  "358": [1, 0, 1, 1, 0, 0, 1],
  "359": [1, 1, 1, 1, 0, 0, 1],
  "360": [1, 0, 0, 0, 1, 0, 1],
  "361": [1, 1, 0, 0, 1, 0, 1],
  "362": [1, 0, 1, 0, 1, 0, 1],
  "363": [1, 1, 1, 0, 1, 0, 1],
  "364": [1, 0, 0, 1, 1, 0, 1],
  "365": [1, 1, 0, 1, 1, 0, 1],
  "366": [1, 0, 1, 1, 1, 0, 1],
  "367": [1, 1, 1, 1, 1, 0, 1],
  "368": [1, 0, 0, 0, 0, 1, 1],
  "369": [1, 1, 0, 0, 0, 1, 1],
  "370": [1, 0, 1, 0, 0, 1, 1],
  "371": [1, 1, 1, 0, 0, 1, 1],
  "372": [1, 0, 0, 1, 0, 1, 1],
  "373": [1, 1, 0, 1, 0, 1, 1],
  "374": [1, 0, 1, 1, 0, 1, 1],
  "375": [1, 1, 1, 1, 0, 1, 1],
  "376": [1, 0, 0, 0, 1, 1, 1],
  "377": [1, 1, 0, 0, 1, 1, 1],
  "378": [1, 0, 1, 0, 1, 1, 1],
  "379": [1, 1, 1, 0, 1, 1, 1],
  "380": [1, 0, 0, 1, 1, 1, 1],
  "381": [1, 1, 0, 1, 1, 1, 1],
  "382": [1, 0, 1, 1, 1, 1, 1],
  "383": [1, 1, 1, 1, 1, 1, 1],
  "384": [0, 0, 0, 0, 0, 0, 0],
  "385": [0, 1, 0, 0, 0, 0, 0],
  "386": [0, 0, 1, 0, 0, 0, 0],
  "387": [0, 1, 1, 0, 0, 0, 0],
  "388": [0, 0, 0, 1, 0, 0, 0],
  "389": [0, 1, 0, 1, 0, 0, 0],
  "390": [0, 0, 1, 1, 0, 0, 0],
  "391": [0, 1, 1, 1, 0, 0, 0],
  "392": [0, 0, 0, 0, 1, 0, 0],
  "393": [0, 1, 0, 0, 1, 0, 0],
  "394": [0, 0, 1, 0, 1, 0, 0],
  "395": [0, 1, 1, 0, 1, 0, 0],
  "396": [0, 0, 0, 1, 1, 0, 0],
  "397": [0, 1, 0, 1, 1, 0, 0],
  "398": [0, 0, 1, 1, 1, 0, 0],
  "399": [0, 1, 1, 1, 1, 0, 0],
  "400": [0, 0, 0, 0, 0, 1, 0],
  "401": [0, 1, 0, 0, 0, 1, 0],
  "402": [0, 0, 1, 0, 0, 1, 0],
  "403": [0, 1, 1, 0, 0, 1, 0],
  "404": [0, 0, 0, 1, 0, 1, 0],
  "405": [0, 1, 0, 1, 0, 1, 0],
  "406": [0, 0, 1, 1, 0, 1, 0],
  "407": [0, 1, 1, 1, 0, 1, 0],
  "408": [0, 0, 0, 0, 1, 1, 0],
  "409": [0, 1, 0, 0, 1, 1, 0],
  "410": [0, 0, 1, 0, 1, 1, 0],
  "411": [0, 1, 1, 0, 1, 1, 0],
  "412": [0, 0, 0, 1, 1, 1, 0],
  "413": [0, 1, 0, 1, 1, 1, 0],
  "414": [0, 0, 1, 1, 1, 1, 0],
  "415": [0, 1, 1, 1, 1, 1, 0],
  "416": [0, 0, 0, 0, 0, 0, 1],
  "417": [0, 1, 0, 0, 0, 0, 1],
  "418": [0, 0, 1, 0, 0, 0, 1],
  "419": [0, 1, 1, 0, 0, 0, 1],
  "420": [0, 0, 0, 1, 0, 0, 1],
  "421": [0, 1, 0, 1, 0, 0, 1],
  "422": [0, 0, 1, 1, 0, 0, 1],
  "423": [0, 1, 1, 1, 0, 0, 1],
  "424": [0, 0, 0, 0, 1, 0, 1],
  "425": [0, 1, 0, 0, 1, 0, 1],
  "426": [0, 0, 1, 0, 1, 0, 1],
  "427": [0, 1, 1, 0, 1, 0, 1],
  "428": [0, 0, 0, 1, 1, 0, 1],
  "429": [0, 1, 0, 1, 1, 0, 1],
  "430": [0, 0, 1, 1, 1, 0, 1],
  "431": [0, 1, 1, 1, 1, 0, 1],
  "432": [0, 0, 0, 0, 0, 1, 1],
  "433": [0, 1, 0, 0, 0, 1, 1],
  "434": [0, 0, 1, 0, 0, 1, 1],
  "435": [0, 1, 1, 0, 0, 1, 1],
  "436": [0, 0, 0, 1, 0, 1, 1],
  "437": [0, 1, 0, 1, 0, 1, 1],
  "438": [0, 0, 1, 1, 0, 1, 1],
  "439": [0, 1, 1, 1, 0, 1, 1],
  "440": [0, 0, 0, 0, 1, 1, 1],
  "441": [0, 1, 0, 0, 1, 1, 1],
  "442": [0, 0, 1, 0, 1, 1, 1],
  "443": [0, 1, 1, 0, 1, 1, 1],
  "444": [0, 0, 0, 1, 1, 1, 1],
  "445": [0, 1, 0, 1, 1, 1, 1],
  "446": [0, 0, 1, 1, 1, 1, 1],
  "447": [0, 1, 1, 1, 1, 1, 1],
  "448": [1, 0, 0, 0, 0, 0, 0],
  "449": [1, 1, 0, 0, 0, 0, 0],
  "450": [1, 0, 1, 0, 0, 0, 0],
  "451": [1, 1, 1, 0, 0, 0, 0],
  "452": [1, 0, 0, 1, 0, 0, 0],
  "453": [1, 1, 0, 1, 0, 0, 0],
  "454": [1, 0, 1, 1, 0, 0, 0],
  "455": [1, 1, 1, 1, 0, 0, 0],
  "456": [1, 0, 0, 0, 1, 0, 0],
  "457": [1, 1, 0, 0, 1, 0, 0],
  "458": [1, 0, 1, 0, 1, 0, 0],
  "459": [1, 1, 1, 0, 1, 0, 0],
  "460": [1, 0, 0, 1, 1, 0, 0],
  "461": [1, 1, 0, 1, 1, 0, 0],
  "462": [1, 0, 1, 1, 1, 0, 0],
  "463": [1, 1, 1, 1, 1, 0, 0],
  "464": [1, 0, 0, 0, 0, 1, 0],
  "465": [1, 1, 0, 0, 0, 1, 0],
  "466": [1, 0, 1, 0, 0, 1, 0],
  "467": [1, 1, 1, 0, 0, 1, 0],
  "468": [1, 0, 0, 1, 0, 1, 0],
  "469": [1, 1, 0, 1, 0, 1, 0],
  "470": [1, 0, 1, 1, 0, 1, 0],
  "471": [1, 1, 1, 1, 0, 1, 0],
  "472": [1, 0, 0, 0, 1, 1, 0],
  "473": [1, 1, 0, 0, 1, 1, 0],
  "474": [1, 0, 1, 0, 1, 1, 0],
  "475": [1, 1, 1, 0, 1, 1, 0],
  "476": [1, 0, 0, 1, 1, 1, 0],
  "477": [1, 1, 0, 1, 1, 1, 0],
  "478": [1, 0, 1, 1, 1, 1, 0],
  "479": [1, 1, 1, 1, 1, 1, 0],
  "480": [1, 0, 0, 0, 0, 0, 1],
  "481": [1, 1, 0, 0, 0, 0, 1],
  "482": [1, 0, 1, 0, 0, 0, 1],
  "483": [1, 1, 1, 0, 0, 0, 1],
  "484": [1, 0, 0, 1, 0, 0, 1],
  "485": [1, 1, 0, 1, 0, 0, 1],
  "486": [1, 0, 1, 1, 0, 0, 1],
  "487": [1, 1, 1, 1, 0, 0, 1],
  "488": [1, 0, 0, 0, 1, 0, 1],
  "489": [1, 1, 0, 0, 1, 0, 1],
  "490": [1, 0, 1, 0, 1, 0, 1],
  "491": [1, 1, 1, 0, 1, 0, 1],
  "492": [1, 0, 0, 1, 1, 0, 1],
  "493": [1, 1, 0, 1, 1, 0, 1],
  "494": [1, 0, 1, 1, 1, 0, 1],
  "495": [1, 1, 1, 1, 1, 0, 1],
  "496": [1, 0, 0, 0, 0, 1, 1],
  "497": [1, 1, 0, 0, 0, 1, 1],
  "498": [1, 0, 1, 0, 0, 1, 1],
  "499": [1, 1, 1, 0, 0, 1, 1],
  "500": [1, 0, 0, 1, 0, 1, 1],
  "501": [1, 1, 0, 1, 0, 1, 1],
  "502": [1, 0, 1, 1, 0, 1, 1],
  "503": [1, 1, 1, 1, 0, 1, 1],
  "504": [1, 0, 0, 0, 1, 1, 1],
  "505": [1, 1, 0, 0, 1, 1, 1],
  "506": [1, 0, 1, 0, 1, 1, 1],
  "507": [1, 1, 1, 0, 1, 1, 1],
  "508": [1, 0, 0, 1, 1, 1, 1],
  "509": [1, 1, 0, 1, 1, 1, 1],
  "510": [1, 0, 1, 1, 1, 1, 1],
  "511": [1, 1, 1, 1, 1, 1, 1],
};
