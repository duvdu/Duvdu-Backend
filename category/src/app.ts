import { globalErrorHandlingMiddleware } from '@duvdu-v1/duvdu';
import connectRedis from 'connect-redis';
import express from 'express';
import session from 'express-session';
import { createClient } from 'redis';

import { env } from './config/env';
import { router as categoryRoutes } from './routes/index';

export const app = express();

app.set('trust proxy', true);
app.use(express.json());

let redisStore;

if (process.env.NODE_ENV != 'test') {
  const redisClient = createClient({
    url: 'redis://expiration-redis-srv:6379',
  });
  redisClient.connect().catch(console.error);
  redisClient.on('connect', () => {
    console.log('Connected to Redis');
  });
  redisStore = new connectRedis({client:redisClient});
}

app.use(
  session({
    secret: env.expressSession.secret,
    resave: false,
    saveUninitialized: false,
    store: redisStore,
    cookie: {
      sameSite: 'lax',
      secure: env.environment === 'production',
      httpOnly: true,
    },
  })
);
app.get('/test', (req, res) => {
  req.session.jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjlmOTEzMzNiNTg0ODA3YTg1NDg2MCIsInBlcm1lc3Npb24iOlsidXBkYXRlUHJvZmlsZSJdLCJpYXQiOjE3MTA4ODEwNDMsImV4cCI6MTcxMDg4MTEwM30.e211RTlR7mgiDFEYT8KAYuAdw_2CTIQc2cCmCpQZAQw';
  res.send('Session cookie generated successfully.');
});
app.use('/api/category', categoryRoutes);
app.use(globalErrorHandlingMiddleware);
