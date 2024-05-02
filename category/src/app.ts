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
    origin: ['*', 'http://localhost:3000'],
    credentials: true,
    exposedHeaders: ['set-cookie'],
  }),
);

app.use(
  session({
    secret: env.expressSession.secret,
    resave: false,
    saveUninitialized: false,
    store:
      env.environment !== 'test' && env.expressSession.allowUseStorage
        ? sessionStore(env.redis.uri , env.redis.pass)
        : undefined,
    cookie: {
      sameSite: 'none',
      secure: env.environment === 'production',
      httpOnly: true,
    },
  }),
);

app.use(languageHeaderMiddleware);


app.use('/api/category', categoryRoutes);

app.use(globalErrorHandlingMiddleware);
