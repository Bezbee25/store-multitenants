import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // OBLIGATOIRE WoxxApp pour le routage sous proxy
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/certs': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
});
