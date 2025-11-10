import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic'
    })
  ],
  server: {
    proxy: {
      '/api/clientes': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/api/pedidos': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/api/carrito': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/api/productos': {
        target: 'http://localhost:3002',
        changeOrigin: true
      },
      '/api/imagenes': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/imagenes/, '/api/productos')
      },
      '/api/categorias': {
        target: 'http://localhost:3002',
        changeOrigin: true
      }
    }
  }
})