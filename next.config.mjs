// @ts-check
import withPWA from "next-pwa";
import * as dotenv from "dotenv";

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  swcMinify: true,
  trailingSlash: true,
};

const maphost = dotenv.config().parsed?.NEXT_PUBLIC_OSM_PROVIDER_HOST ?? "";

const config = async () => {
  /**
   * @type {import('workbox-webpack-plugin').GenerateSWConfig }
   */
  const generateSWConfig = {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-webfonts",
          expiration: {
            maxEntries: 66535,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-stylesheets",
          expiration: {
            maxEntries: 66535,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-font-assets",
          expiration: {
            maxEntries: 66535,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-image-assets",
          expiration: {
            maxEntries: 66535,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\/_next\/image\?url=.+$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-image",
          expiration: {
            maxEntries: 66535,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\.(?:mp3|wav|ogg)$/i,
        handler: "CacheFirst",
        options: {
          rangeRequests: true,
          cacheName: "static-audio-assets",
          expiration: {
            maxEntries: 66535,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\.(?:mp4)$/i,
        handler: "CacheFirst",
        options: {
          rangeRequests: true,
          cacheName: "static-video-assets",
          expiration: {
            maxEntries: 66535,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\.(?:js)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-js-assets",
          expiration: {
            maxEntries: 66535,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\.(?:css|less)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-style-assets",
          expiration: {
            maxEntries: 66535,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-data",
          expiration: {
            maxEntries: 66535,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: ({ url }) => url.origin.includes("fastly.net"),
        handler: "CacheFirst",
        options: {
          cacheName: "map",
          expiration: {
            maxEntries: 66535,
            maxAgeSeconds: 24 * 60 * 60 * 265, // 1 year
          },
        },
      },
      {
        urlPattern: ({ url }) =>
          url.origin.includes("rt.data.gov.hk") ||
          url.origin.includes("data.etabus.gov.hk"),
        handler: "NetworkFirst",
        options: {
          cacheName: "bus-route-and-eta",
          expiration: {
            maxEntries: 66535,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: ({ url }) => url.origin.includes("hkbus.github.io"),
        handler: "CacheFirst",
        options: {
          cacheName: "bus-route-and-eta",
          expiration: {
            maxEntries: 66535,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\.(?:json|xml|csv)$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "static-data-assets",
          expiration: {
            maxEntries: 66535,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: ({ url }) => {
          const isSameOrigin = self.origin === url.origin;
          if (!isSameOrigin) return false;
          const pathname = url.pathname;
          // Exclude /api/auth/callback/* to fix OAuth workflow in Safari without impact other environment
          // Above route is default for next-auth, you may need to change it if your OAuth workflow has a different callback route
          // Issue: https://github.com/shadowwalker/next-pwa/issues/131#issuecomment-821894809
          if (pathname.startsWith("/api/auth/")) return false;
          if (pathname.startsWith("/api/")) return true;
          return false;
        },
        handler: "NetworkFirst",
        method: "GET",
        options: {
          cacheName: "apis",
          expiration: {
            maxEntries: 66535,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
          networkTimeoutSeconds: 10, // fall back to cache if api does not response within 10 seconds
        },
      },
      {
        urlPattern: ({ url }) => {
          const isSameOrigin = self.origin === url.origin;
          if (!isSameOrigin) return false;
          const pathname = url.pathname;
          if (pathname.startsWith("/api/")) return false;
          return true;
        },
        handler: "NetworkFirst",
        options: {
          cacheName: "others",
          expiration: {
            maxEntries: 66535,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: ({ url }) => {
          const isSameOrigin = self.origin === url.origin;
          return !isSameOrigin;
        },
        handler: "NetworkFirst",
        options: {
          cacheName: "cross-origin",
          expiration: {
            maxEntries: 66535,
            maxAgeSeconds: 60 * 60, // 1 hour
          },
          networkTimeoutSeconds: 10,
        },
      },
    ],
  };
  return withPWA({
    ...nextConfig,
    pwa: {
      dest: "public",
      register: false,
      skipWaiting: true,
      ...generateSWConfig,
      buildExcludes: [/middleware-manifest.json$/],
      cacheOnFrontEndNav: true,
    },
  });
};

export default config;
