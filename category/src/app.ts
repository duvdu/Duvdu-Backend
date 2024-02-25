import { globalErrorHandlingMiddleware } from '@duvdu-v1/duvdu';
import connectRedis from 'connect-redis';
import express from 'express';
import session from 'express-session';
import { createClient } from 'redis';

import { env } from './config/env';
import { router as categoryRoutes } from './routes/index';

export const app = express();

app.set('trust proxy', 1);

const redisClient = createClient({
  url: 'redis://expiration-redis-srv:6379', 
});

redisClient.connect().catch(console.error);
redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

const redisStore = new connectRedis({client:redisClient});

app.use(session({
  store: redisStore,
  secret: env.expressSession.secret,
  saveUninitialized: false,
  resave: false,
  cookie: {
    secure: env.environment === 'production', 
    httpOnly: true,
    sameSite: 'lax',
  },
}));

app.use(express.json());
app.use('/api/category', categoryRoutes);
app.use(globalErrorHandlingMiddleware);