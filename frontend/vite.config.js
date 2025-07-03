// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // Oder welcher Plugin du auch immer für dein Framework nutzt (Vue, Svelte, etc.)

export default defineConfig({
  plugins: [react()], // Oder deine anderen Plugins
  
  server: {
    port: 5173, // Optional: Stelle sicher, dass dies dein gewünschter Frontend-Port ist
    proxy: {
      // Proxy-Regel für deine API-Anfragen
      // Wenn das Frontend eine Anfrage an '/api' sendet...
      '/api': {
        target: 'http://localhost:8080', // ...leite sie an dein Backend auf Port 5000 weiter
        changeOrigin: true, // Wichtig: Ändert den Host-Header der Anfrage zur Ziel-URL
        secure: false, // Setze dies auf true, wenn dein Backend HTTPS verwendet (normalerweise nicht im Dev-Modus)
        // rewrite: (path) => path.replace(/^\/api/, '/api'), // Optional: Belasse /api im Pfad, falls dein Backend es erwartet
      },
     

    },
  },
});