import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "MamaSaheli",
        short_name: "MamaSaheli",
        description: "MamaSaheli - Health, Support, and Community",
        start_url: ".",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#f472b6",
        icons: [
          {
            src: "/favicon.ico",
            sizes: "48x48 72x72 96x96 128x128 256x256 512x512",
            type: "image/x-icon"
          },
          {
            src: "/hero.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));