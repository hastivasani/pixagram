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
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('socket.io-client')) return 'socket';
            if (id.includes('emoji-picker-react')) return 'emoji';
            if (id.includes('react-icons')) return 'icons';
            if (id.includes('react-dom') || id.includes('react-router')) return 'vendor';
            if (id.includes('react')) return 'vendor';
          }
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
