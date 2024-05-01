import 'express-async-errors';
import './types/custom-definition';
import { globalErrorHandlingMiddleware, sessionStore } from '@duvdu-v1/duvdu';
import cors from 'cors';
import express from 'express';
import session from 'express-session';

import { env } from './config/env';
import { passport } from './controllers/auth/passport.controller';
import { apiRoutes } from './routes';
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
    resave: true,
    saveUninitialized: false,
    store:
      env.environment !== 'test' && env.expressSession.allowUseStorage
        ? sessionStore('redis://redis-13741.c84.us-east-1-2.ec2.redns.redis-cloud.com:13741')
        : undefined,
    cookie: {
      sameSite: 'none',
      secure: env.environment === 'production',
      httpOnly: true,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/users', apiRoutes);

app.use(globalErrorHandlingMiddleware);
