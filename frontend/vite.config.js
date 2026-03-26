import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ command }) => ({
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
    ...(command === 'serve' ? [basicSsl()] : []),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  build: {
    chunkSizeWarningLimit: 1500,
    target: 'es2020',
  },
  optimizeDeps: {
    include: ['deepar', 'three', '@tensorflow-models/body-pix'],
    exclude: ['@mediapipe/face_detection', '@mediapipe/camera_utils'],
  },
}))
