import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import flowbiteReact from "flowbite-react/plugin/vite";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), flowbiteReact(), tailwindcss()],
  server: {
    proxy: {
      "/api/games": "http://localhost:3000",
      "/api/stats": "http://localhost:3000",
      "^/api/stream/.*": {
        target: "ws://localhost:3000",
        ws: true,
      },
    },
  },
});
