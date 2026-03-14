import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for offline/USB deployment
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    target: 'es2015',
    minify: 'terser',
    cssCodeSplit: false, // Bundle all CSS into one file
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
})
