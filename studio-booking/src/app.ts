import { globalErrorHandlingMiddleware, sessionStore } from '@duvdu-v1/duvdu';
import express from 'express';
import session from 'express-session';

import { env } from './config/env';
import {router as studioBookingRoutes } from '../src/routes';

export const app = express();

app.set('trust proxy', true);
app.use(express.json());

app.use(
  session({
    secret: env.expressSession.secret,
    resave: false,
    saveUninitialized: false,
    store:
      env.environment !== 'test' && env.expressSession.allowUseStorage ? sessionStore(env.redis.uri) : undefined,
    cookie: {
      sameSite: 'lax',
      secure: env.environment === 'production',
      httpOnly: true,
    },
  }),
);

app.use('/api/studio-booking' , studioBookingRoutes);
app.use(globalErrorHandlingMiddleware);
