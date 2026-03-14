import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for offline/USB deployment
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0, // Don't inline any assets to keep file structure clear
    rollupOptions: {
      output: {
        manualChunks: undefined // Keep everything in one bundle for simplicity
      }
    }
  }
})
