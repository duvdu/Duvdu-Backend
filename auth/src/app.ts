import { globalErrorHandlingMiddleware } from '@duvdu-v1/duvdu';
import cookieSession from 'cookie-session';
import express from 'express';

import { env } from './config/env';
import { apiRoutes } from './routes';

export const app = express();

app.set('trust proxy', true);
app.use(express.json());
app.use(cookieSession({ signed: false, secure: env.environment !== 'test' }));

app.use('/api/auth', apiRoutes);

app.use(globalErrorHandlingMiddleware);
