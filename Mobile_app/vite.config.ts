import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-oxc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: false },
      includeAssets: ["nutrisense-logo.png"],
      manifest: {
        name: "Nutri Sense — Student Health & Wallet",
        short_name: "Nutri Sense",
        description: "Your student health and cafeteria wallet portal. Track nutrition, check menus, and manage your campus funds.",
        theme_color: "#EA5C1F",
        background_color: "#F5F5F5",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/nutrisense-logo.png", sizes: "192x192", type: "image/png" },
          { src: "/nutrisense-logo.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        importScripts: ["/sw-push.js"],
        navigateFallbackDenylist: [/^\/~oauth/],
        // Never serve Supabase API calls from cache — required for auth token refresh to work reliably
        runtimeCaching: [
          {
            urlPattern: ({ url }: { url: URL }) => url.hostname.includes("supabase.co"),
            handler: "NetworkOnly",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
}));
