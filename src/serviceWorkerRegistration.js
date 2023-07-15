import { Workbox, messageSW } from "workbox-window";
// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read https://cra.link/PWA

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);
/**
 *
 * @param {{
 *   onSuccess?: (registration: Workbox) => void;
 *   onUpdate?: (registration: Workbox, skipWaiting: () => void, installingServiceWorker: ServiceWorker) => void;
 * }} config
 * @returns {Promise<Workbox | undefined>}
 */
export const register = async (config) => {
  if ("serviceWorker" in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return undefined;
    }
    return new Promise((resolve, rejects) => {
      window.addEventListener("load", () => {
        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

        if (isLocalhost) {
          navigator.serviceWorker.ready.then(() => {
            // Add some additional logging to localhost, pointing developers to the
            // service worker/PWA documentation.
            console.log(
              "This web app is being served cache-first by a service " +
                "worker. To learn more, visit https://cra.link/PWA"
            );
          });

          // This is running on localhost. Let's check if a service worker still exists or not.
          checkValidServiceWorker(swUrl, config).then(resolve, rejects);
        } else {
          // Is not localhost. Just register service worker
          registerValidSW(swUrl, config).then(resolve, rejects);
        }
      });
    });
  }
  return undefined;
};

const registerValidSW = async (swUrl, config) => {
  const wb = new Workbox(swUrl);
  const waitingHandler = (event) => {
    if (event.sw !== undefined && config && config.onUpdate) {
      const sw = event.sw;
      config.onUpdate(wb, () => messageSW(sw, { type: "SKIP_WAITING" }), sw);
    }
  };
  const controllingHandler = (event) => {
    if (event.isUpdate) {
      window.location.reload();
    } else {
      if (config && config.onSuccess) {
        config.onSuccess(wb);
      }
    }
  };
  wb.addEventListener("waiting", waitingHandler);
  wb.addEventListener("externalwaiting", waitingHandler);
  wb.addEventListener("controlling", controllingHandler);
  await wb.register();
  return wb;
};

const checkValidServiceWorker = async (swUrl, config) => {
  // Check if the service worker can be found. If it can't reload the page.
  try {
    const response = await fetch(swUrl, {
      headers: { "Service-Worker": "script" },
    });
    // Ensure service worker exists, and that we really are getting a JS file.
    const contentType = response.headers.get("content-type");
    if (
      response.status === 404 ||
      (contentType != null && contentType.indexOf("javascript") === -1)
    ) {
      // No service worker found. Probably a different app. Reload the page.
      navigator.serviceWorker.ready.then((registration) => {
        registration.unregister().then(() => {
          window.location.reload();
        });
      });
      return undefined;
    } else {
      // Service worker found. Proceed as normal.
      return registerValidSW(swUrl, config);
    }
  } catch (e) {
    console.log(
      "No internet connection found. App is running in offline mode."
    );
  }
};

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
