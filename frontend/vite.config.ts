import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// The backend Django dev server. The proxy below lets phones on the café
// Wi-Fi reach the API through the same origin as the page (no CORS, and no
// second LAN address to configure): set VITE_API_URL=/api/v1.
const BACKEND = process.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    host: true, // listen on the LAN so table QR codes open on phones
    proxy: {
      '/api': BACKEND,
      '/media': BACKEND,
    },
  },
  preview: {
    host: true,
    proxy: {
      '/api': BACKEND,
      '/media': BACKEND,
    },
  },
  optimizeDeps: {
    // Explicitly tell Vite to include react-is so recharts can resolve it
    include: ['react-is', 'recharts'],
  },
})
