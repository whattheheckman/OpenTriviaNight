import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/games": "http://localhost:3000",
      "^/api/stream/.*": {
        target: "ws://localhost:3000",
        ws: true,
      },
    },
  },
});
