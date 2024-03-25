import 'express-async-errors';
import './types/custom-definition';
import { globalErrorHandlingMiddleware } from '@duvdu-v1/duvdu';
import express from 'express';
import session from 'express-session';

import { env } from './config/env';
import { sessionStore } from './config/redis';
export const app = express();

app.use(express.json());

app.use(
  session({
    secret: env.expressSession.secret,
    resave: false,
    saveUninitialized: false,
    store:
      env.environment !== 'test' && env.expressSession.allowUseStorage ? sessionStore() : undefined,
    cookie: {
      sameSite: 'lax',
      secure: env.environment === 'production',
      httpOnly: true,
    },
  })
);

app.use('/', (req, res) => {
  res.send('server runs');
});

app.use(globalErrorHandlingMiddleware);
