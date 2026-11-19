import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function assetPathRewritePlugin() {
  return {
    name: 'asset-path-rewrite',
    enforce: 'post',
    transform(code, id) {
      if (id.includes('node_modules')) return null;
      if (code.includes('/assets/')) {
        return {
          code: code.replace(/(['"`])\/assets\//g, '$1/ryvon-bike-rental/assets/'),
          map: null
        };
      }
      return null;
    }
  };
}

function spa404Plugin() {
  return {
    name: 'spa-404-fallback',
    closeBundle() {
      const distIndex = path.resolve(__dirname, 'dist/index.html');
      const dist404 = path.resolve(__dirname, 'dist/404.html');
      if (fs.existsSync(distIndex)) {
        fs.copyFileSync(distIndex, dist404);
        console.log('[spa404Plugin] Created dist/404.html for GitHub Pages SPA routing');
      }
    }
  };
}

export default defineConfig({
  base: '/ryvon-bike-rental/',
  plugins: [
    react(),
    assetPathRewritePlugin(),
    spa404Plugin()
  ],
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
