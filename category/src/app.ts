import { globalErrorHandlingMiddleware } from '@duvdu-v1/duvdu';
import express from 'express';
import session from 'express-session';

import { env } from './config/env';

export const app = express();

app.set('trust proxy', true);
app.use(express.json());

app.use(
  session({
    name:'my-session',
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.environment === 'production',
      httpOnly:true
    },
  })
);


app.use(globalErrorHandlingMiddleware);