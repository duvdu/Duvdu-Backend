import { globalErrorHandlingMiddleware } from '@duvdu-v1/duvdu';
import cookieSession from 'cookie-session';
import express from 'express';

import { env } from './config/env';
import passport from './controllers/auth/googleAuth.controller';
import { apiRoutes } from './routes';

export const app = express();

app.set('trust proxy', true);
app.use(express.json());
app.use(cookieSession({ signed: false, secure: env.environment === 'production' }));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/users', apiRoutes);

app.use(globalErrorHandlingMiddleware);
