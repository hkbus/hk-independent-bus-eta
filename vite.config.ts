import { ConfigEnv, defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";
import eslint from "vite-plugin-eslint"

// https://vitejs.dev/config/
export default defineConfig(({mode}: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [
      react(), 
      eslint({
        
      }), 
      basicSsl(), 
      VitePWA(getPwaOptions(env))
    ],
    server: {
      https: true,
      host: true,
      port: 443,
      // port: parseInt(env.PORT ?? "9100", 10),
      // strictPort: true,
    },
    build: {
      outDir: "./build"
    }
  }
});

const getPwaOptions = (env: Record<string, string>): Partial<VitePWAOptions> => {
  const mapUrlPatternFunc = `(({url}) => url.origin.includes("${env.VITE_OSM_PROVIDER_HOST}"))`;
  return {
    mode: "production",
    base: "/",
    manifest: {
      short_name: "巴士預報",
      name: "巴士到站預報 App",
      description: "巴士預報（純享版），資料來源為資料一線通 data.gov.hk",
      icons: [
        {
          src: "favicon.ico",
          sizes: "64x64 32x32 24x24 16x16",
          type: "image/x-icon"
        }, {
          src: "img/logo128.png",
          type: "image/png",
          sizes: "128x128"
        }, {
          src: "img/logo192.png",
          type: "image/png",
          sizes: "192x192"
        }, {
          src: "img/logo512.png",
          type: "image/png",
          sizes: "512x512"
        }
      ],
      start_url: ".",
      display: "standalone",
      theme_color: "#fedb00",
      background_color: "#fedb00"
    },
    devOptions: {
      enabled: process.env.SW_DEV === "true",
      type: "module",
      navigateFallback: "index.html"
    },
    registerType: "autoUpdate",
    workbox: {
      globPatterns: ['**/*.{css,html,ico,png,svg}'],
      runtimeCaching: [
        // for lazy caching anything
        // reference to https://vite-pwa-org.netlify.app/workbox/generate-sw.html#cache-external-resources 
        {
          urlPattern: ({url}) => (
            url.origin === self.location.origin && url.pathname.startsWith("/assets")
          ),
          handler: "CacheFirst",
          options: {
            cacheName: "app-runtime",
            cacheableResponse: {
              statuses: [0, 200],
            }
          }
        },
        {
          urlPattern: ({ url }) =>
            url.origin === self.location.origin &&
            (url.pathname.startsWith("/zh/route/") ||
              url.pathname.startsWith("/en/route/")),
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "app-runtime-public",
            cacheableResponse: {
              statuses: [200],
            },
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 24 * 30,
            }
          }
        },
        {
          urlPattern: ({ url }) =>
            url.origin === self.location.origin &&
            (url.pathname.startsWith("/fonts/") || url.pathname.startsWith("/img/")),
          handler: "CacheFirst",
          options: {
            cacheName: "font-and-asset",
            cacheableResponse: {
              statuses: [0, 200],
            },
            expiration: {
              maxAgeSeconds: 60 * 24 * 365,
            }
          }
        },
        {
          urlPattern: new Function('return ' + mapUrlPatternFunc)(),
          handler: "CacheFirst",
          options: {
            cacheName: "map",
            cacheableResponse: {
              statuses: [200],
            },
            expiration: {
              maxAgeSeconds: 60 * 24 * 30,
              purgeOnQuotaError: true,
            }
          }
        },
      ]
    }
  }
}