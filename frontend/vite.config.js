// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Oder welcher Plugin du auch immer für dein Framework nutzt (Vue, Svelte, etc.)

export default defineConfig({
  plugins: [react()], // Oder deine anderen Plugins
  
  server: {
    port: 5173, // Optional: Stelle sicher, dass dies dein gewünschter Frontend-Port ist
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});