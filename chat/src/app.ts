import 'express-async-errors';
import {
  globalErrorHandlingMiddleware,
  languageHeaderMiddleware,
  sessionStore,
} from '@duvdu-v1/duvdu';
import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';

import { env } from './config/env';
import { moutnRoutes } from './routes';

export const app = express();
app.set('trust proxy', true);
app.use(express.json());
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

let mySession: (req: Request, res: Response, next: NextFunction) => void;

const initializeSessionStore = async () => {
  const store = await sessionStore();

  mySession = (req: Request, res: Response, next: NextFunction) => {
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

  app.use(mySession);
};

(async () => {
  try {
    await initializeSessionStore();
    app.use(languageHeaderMiddleware);
    moutnRoutes(app);
    app.use(globalErrorHandlingMiddleware);
  } catch (error) {
    console.error('Failed to initialize session store', error);
  }
})();

export { mySession };
