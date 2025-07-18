import 'express-async-errors';
import './types/custom-definition';
import {
  globalErrorHandlingMiddleware,
  languageHeaderMiddleware,
  sessionStore,
} from '@duvdu-v1/duvdu';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';

import { env } from './config/env';
import { mountRoutes } from './routes';

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
  const store = await sessionStore();

  const sessionMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers?.origin;
    const isDashboard =
      origin?.includes('dashboard.duvdu.com') || origin?.includes('localhost:3000');

    const sessionConfig = session({
      secret: env.expressSession.secret,
      resave: false,
      saveUninitialized: false,
      store,
      name: isDashboard ? 'dashboard_session' : 'main_session',
      cookie: {
        sameSite: 'none',
        secure: env.environment === 'production',
        httpOnly: true,
        maxAge: 2073600000, // 24 days
        domain: env.environment === 'production' ? '.duvdu.com' : undefined, // Allow subdomains
      },
      proxy: true,
      rolling: true,
    });

    return sessionConfig(req, res, next);
  };

  app.use(sessionMiddleware);
  app.use(languageHeaderMiddleware);
  app.use((req, res, next) => {
    if (req.headers['accept-language']) {
      req.forceLang = true;
    } else {
      req.forceLang = false;
    }
    next();
  });

  mountRoutes(app);

  app.use(globalErrorHandlingMiddleware);
})();
