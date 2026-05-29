import path from 'node:path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { config } from './config/config.js';
import { router as apiRouter } from './routers/index.router.js';

// create express app
export const app = express();

// log every request + response
app.use((req, res, next) => {
  console.log('request', req.method, req.url);
  res.on('finish', () => {
    console.log('response', req.method, req.url, res.statusCode);
  });
  next();
});

// simple routes before parsers
app.get('/ping', (_, res) => {
  console.log('ping route hit');
  res.send('pong');
});

app.get('/', (_, res) => {
  res.send('Welcome | homepage 👋');
});

app.get('/health', (_, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// cookie parser — avant express.json() et toutes les routes
app.use(cookieParser());

// json parser
app.use(express.json());

// cors
app.use(
  cors({
    origin: config.server.allowedOrigins,
    credentials: true,
  }),
);

// images statiques (banners, thumbs)
app.use('/images', express.static(path.resolve('..', 'vite-frontend', 'public', 'images')));

// api router
app.use('/api', apiRouter);

// headers
app.use((_, res, next) => {
  res.setHeader('X-Powered-By', 'ZombieLand');
  next();
});
