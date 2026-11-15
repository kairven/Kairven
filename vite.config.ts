import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import {auditEndpoint} from './vite.audit-plugin'

export default defineConfig({
  plugins: [react(), tailwindcss(), auditEndpoint()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Accept the sandbox preview host and any proxied origin.
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ['gsap', '@gsap/react', 'gsap/ScrollTrigger'],
        },
      },
    },
  },
})
