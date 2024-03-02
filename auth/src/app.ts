import 'express-async-errors';
import './types/custom-definition';
import { globalErrorHandlingMiddleware } from '@duvdu-v1/duvdu';
import express from 'express';
import session from 'express-session';

import { env } from './config/env';
import { sessionStore } from './config/redis';
import passport from './controllers/auth/googleAuth.controller';
import { apiRoutes } from './routes';
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
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/users', apiRoutes);

app.use(globalErrorHandlingMiddleware);
