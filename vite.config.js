import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["pdf-file.svg", "pwa-192x192.svg", "pwa-512x512.svg", "gs-worker.wasm"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,wasm,data}"],
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50MB for WASM files
      },
      manifest: {
        name: "PDF Tools by PWA Suite",
        short_name: "PDF Tools",
        description: "Free browser-based PDF tools - Compress, Merge, Split, and more. All processing happens locally.",
        theme_color: "#0078d4",
        background_color: "#1e1e1e",
        display: "standalone",
        scope: "./",
        start_url: "./",
        icons: [
          {
            src: "pwa-192x192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any maskable"
          },
          {
            src: "pwa-512x512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      }
    })
  ],
  build: { target: "esnext" },
  base: "./",
  worker: { format: "es" }
});
