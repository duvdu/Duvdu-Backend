import 'express-async-errors';
import './types/custom-definition';
import {
  globalErrorHandlingMiddleware,
  sessionStore,
  languageHeaderMiddleware,
} from '@duvdu-v1/duvdu';
import cors from 'cors';
import express from 'express';
import session from 'express-session';

import { env } from './config/env';
import { router as categoryRoutes } from './routes/index';

export const app = express();

app.use(express.json());

app.set('trust proxy', true);

app.use(
  cors({
    origin: [
      '*',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://duvdu.com',
      'https://www.duvdu.com',
      'https://dashboard.duvdu.com',
      'https://mainstreet.company',
    ],
    credentials: true,
    exposedHeaders: ['set-cookie'],
  }),
);

(async () => {
  const store = await sessionStore(env.redis.uri, env.redis.pass);

  app.use(
    session({
      secret: env.expressSession.secret,
      resave: false,
      saveUninitialized: false,
      store,
      cookie: {
        sameSite: 'none',
        secure: env.environment === 'production',
        httpOnly: true,
        maxAge: 2073600000, // 24 days
      },
      proxy: true,
      rolling: true,
    }),
  );

  app.use(languageHeaderMiddleware);

  app.use('/api/category', categoryRoutes);

  app.use(globalErrorHandlingMiddleware);
})();
