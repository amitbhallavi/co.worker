import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env': {},
    'process.argv': [],
    'process.version': '"v18.0.0"',
    'process.platform': '"browser"',
  },
  resolve: {
    alias: {
      colors: false   // ← colors ko completely block karo
    }
  },
  optimizeDeps: {
    exclude: ['colors']  // ← bundle se bahar rakho
  },
  server: {
    proxy: {
      "/api": {
        target: 'http://localhost:5050',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})