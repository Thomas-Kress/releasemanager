import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Share the backend's .env in the project root; only VITE_-prefixed
  // variables (e.g. VITE_CLERK_PUBLISHABLE_KEY) are exposed to the browser.
  envDir: '..',
  server: {
    // Forward API calls to the FastAPI backend during development so the
    // dashboard can call relative paths like "/api/status" without CORS.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
