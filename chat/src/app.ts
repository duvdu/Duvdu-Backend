import 'express-async-errors';
import { globalErrorHandlingMiddleware, sessionStore } from '@duvdu-v1/duvdu';
import cors from 'cors';
import express from 'express';
import session from 'express-session';

import { env } from './config/env';
import { moutnRoutes } from './routes';

export const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(
  cors({
    origin: ['*', 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    exposedHeaders: ['set-cookie'],
  }),
);


export async function setupSessionMiddleware() {
  return session({
    secret: env.expressSession.secret,
    resave: false,
    saveUninitialized: false,
    store:
      env.environment !== 'test' && env.expressSession.allowUseStorage
        ? await sessionStore(env.redis.uri, env.redis.pass)
        : undefined,
    cookie: {
      sameSite: 'none',
      secure: env.environment === 'production',
      httpOnly: true,
    },
  });
}

(async () => {
  const mySession = await setupSessionMiddleware();
  app.use(mySession);
  moutnRoutes(app);
  app.use(globalErrorHandlingMiddleware);
})();
