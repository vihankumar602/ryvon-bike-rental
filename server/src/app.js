const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const { apiLimiter } = require('./middleware/rateLimit');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.disable('x-powered-by');
if (config.trustProxy) app.set('trust proxy', /^\d+$/.test(config.trustProxy) ? Number(config.trustProxy) : config.trustProxy);

// ---- API ------------------------------------------------------------------
// Helmet's default CSP would block the existing frontend's inline scripts/fonts, so it is
// applied to /api only; static frontend files are served exactly as they are today.
app.use('/api', helmet());
const defaultDevOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:5173', 'http://127.0.0.1:5173'];
const allowedCors = config.corsOrigins.length
  ? config.corsOrigins
  : (origin, callback) => {
      if (!origin || origin === 'null' || (!config.isProd && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))) {
        return callback(null, true);
      }
      callback(null, defaultDevOrigins.includes(origin));
    };
app.use('/api', cors({ origin: allowedCors, methods: ['GET', 'POST', 'PATCH', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use('/api', apiLimiter);
app.use('/api', express.json({ limit: '50kb' }));

app.use('/api/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/bikes', require('./routes/bikes'));
app.use('/api/extras', require('./routes/extras'));
app.use('/api/bookings', require('./routes/bookings'));

// ---- Existing frontend (served unchanged, same URLs as before) ---------------
// Only these three paths are exposed, so server/.env and server/ source are never reachable.
const root = config.frontendDir;
if (fs.existsSync(path.join(root, 'index.html'))) {
  app.use('/assets', express.static(path.join(root, 'assets')));
  app.use('/pages', express.static(path.join(root, 'pages')));
  app.get('/', (req, res) => res.sendFile(path.join(root, 'index.html')));
  app.get('/index.html', (req, res) => res.sendFile(path.join(root, 'index.html')));
}

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
