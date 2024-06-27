import 'express-async-errors';
import { globalErrorHandlingMiddleware, languageHeaderMiddleware, sessionStore } from '@duvdu-v1/duvdu';
import cors from 'cors';
import express, { RequestHandler } from 'express';
import session from 'express-session';

import { env } from './config/env';
import { moutnRoutes } from './routes';

export const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(
  cors({
    origin: ['*','http://localhost:3000', 'http://localhost:3001' , 'https://duvdu.com' , 'https://www.duvdu.com'],
    credentials: true,
    exposedHeaders: ['set-cookie'],
  }),
);


let mySession:RequestHandler;

const initializeSessionStore = async () => {
  const store = await sessionStore(env.redis.uri, env.redis.pass);

  mySession = session({
    secret: env.expressSession.secret,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      sameSite: 'none',
      secure: env.environment === 'production',
      httpOnly: true,
    },
  });

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