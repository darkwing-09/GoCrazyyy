import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  build: {
    // The 3D tubes chunk (~210 kB gzip) is lazy-loaded after first paint; the app shell stays under the limit.
    chunkSizeWarningLimit: 800,
  },
  server: {
    port: 5173,
    // Allow ngrok tunnels to reach the dev server (Vite rejects unknown Host headers by default).
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.app', '.ngrok.dev', '.ngrok.io'],
    proxy: {
      '/api': 'http://localhost:8000',
      '/out': 'http://localhost:8000',
      '/webhooks': 'http://localhost:8000',
    },
  },
})
