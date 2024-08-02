import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/stream/negotiate": "http://localhost:5066",
      "/api/stream": "ws://localhost:5066"
    }
  }
})
