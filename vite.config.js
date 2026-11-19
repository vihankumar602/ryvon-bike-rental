import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            console.warn('[Vite Proxy] Backend connection to http://localhost:3000 failed:', err.message);
            if (res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                error: {
                  code: 'BACKEND_OFFLINE',
                  message: 'RYVON backend server is offline or unreachable on port 3000. Start it with `npm run server` or `npm run dev`.'
                }
              }));
            }
          });
        }
      }
    }
  }
});
