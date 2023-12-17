import type { Company, StopListEntry } from "hk-bus-eta";
import type { Location as GeoLocation } from "hk-bus-eta";
import type { TransportType, WarnUpMessageData } from "./typing";
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

export const getDistanceWithUnit = (distanceInMetre: number) => {
  const isKm = distanceInMetre >= 1000;
  return {
    distance: isKm ? distanceInMetre / 1000 : distanceInMetre,
    unit: isKm ? "公里" : "米",
    decimalPlace: isKm ? 1 : 0,
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

export const coToType: Record<Company, TransportType> = {
  kmb: "bus",
  nlb: "bus",
  ctb: "bus",
  lrtfeeder: "bus",
  gmb: "minibus",
  gmbHki: "minibus",
  gmbKln: "minibus",
  gmbNt: "minibus",
  lightRail: "lightRail",
  mtr: "mtr",
};
