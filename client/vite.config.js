import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }

          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/')
          ) {
            return 'react-vendor'
          }

          if (id.includes('/react-router') || id.includes('@remix-run')) {
            return 'router-vendor'
          }

          if (id.includes('/@reduxjs/') || id.includes('/redux/')) {
            return 'redux-vendor'
          }

          if (id.includes('/framer-motion/')) {
            return 'motion-vendor'
          }

          if (id.includes('/socket.io-client/') || id.includes('/socket.io-parser/')) {
            return 'socket-vendor'
          }

          if (id.includes('/axios/')) {
            return 'network-vendor'
          }

          return 'ui-vendor'
        },
      },
    },
  },
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
