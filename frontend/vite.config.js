import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    https: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  plugins: [
    basicSsl(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor':  ['react', 'react-dom', 'react-router-dom'],
          'socket':  ['socket.io-client'],
          'icons':   ['react-icons'],
          'emoji':   ['emoji-picker-react'],
          'media':   ['deepar', 'three'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    target: 'es2020',
  },
  optimizeDeps: {
    include: ['deepar', 'three', '@tensorflow-models/body-pix'],
    exclude: ['@mediapipe/face_detection', '@mediapipe/camera_utils'],
    esbuildOptions: { target: 'es2020' },
  },
})
