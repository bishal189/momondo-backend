import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const forCpanel = process.env.BUILD_CPANEL === '1'

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    minify: forCpanel ? false : 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        format: 'es',
      },
    },
  },
})
