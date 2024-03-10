import { ConfigEnv, defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({mode}: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), basicSsl(), VitePWA(pwaOptions)],
    server: {
      https: false,
      host: true,
      // port: parseInt(env.PORT ?? "9100", 10),
      // strictPort: true,
    },
    build: {
      outDir: "./build"
    }
  }
});

const pwaOptions: Partial<VitePWAOptions> = {
  mode: "development",
  base: "/",
  includeAssets: ["vite.svg"], // as favicon.ico
  manifest: {
    name: 'React app template',
    short_name: 'PWA',
    theme_color: '#ffffff',
    icons: [
      {
        src: 'vite.svg',
        sizes: 'any',
        purpose: 'any',
        type: "image/svg+xml"
      },
    ],
    display: 'standalone',
  },
  devOptions: {
    enabled: process.env.SW_DEV === "true",
    type: "module",
    navigateFallback: "index.html"
  },
  registerType: "autoUpdate",
  workbox: {
    runtimeCaching: [
      // for lazy caching anything
      // reference to https://vite-pwa-org.netlify.app/workbox/generate-sw.html#cache-external-resources 
    ]
  }
}
