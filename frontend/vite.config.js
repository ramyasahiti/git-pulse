import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://fastapi-service:8000',
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})