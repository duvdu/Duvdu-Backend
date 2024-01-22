import { globalErrorHandlingMiddleware } from '@duvdu-v1/duvdu';
import cookieSession from 'cookie-session';
import express from 'express';

import { env } from './config/env';
import { apiRoutes } from './routes';

export const app = express();

app.set('trust proxy', true);
app.use(express.json());
app.use(cookieSession({ signed: false, secure: env.environment !== 'test' }));

app.use('/api/users', apiRoutes);

app.get('/api/users/healthz', (req, res) =>
  res.status(200).json({ message: 'success', data: 'server listen on port 3000' }),
);

app.use(globalErrorHandlingMiddleware);
