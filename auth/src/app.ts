import { globalErrorHandlingMiddleware } from '@duvdu-v1/duvdu';
import connectRedis from 'connect-redis';
import express from 'express';
import session from 'express-session';
import { createClient } from 'redis';

import { env } from './config/env';
import passport from './controllers/auth/googleAuth.controller';
import { savedProjectRoutes } from './routes/saved-project.routes';
import { router as termsRoutes } from './routes/term';
import { router as ticketRoutes } from './routes/ticket';
import { apiRoutes } from './routes/user';
export const app = express();

app.set('trust proxy', true);
app.use(express.json());

let redisStore;

if (process.env.NODE_ENV != 'test') {
  const redisClient = createClient({
    // url: 'redis://expiration-redis-srv:6379',
    url: 'redis://localhost:6379',
  });
  redisClient.connect().catch(console.error);
  redisClient.on('connect', () => {
    console.log('Connected to Redis');
  });
  redisStore = new connectRedis({ client: redisClient });
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
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/users/ticket', ticketRoutes);
app.use('/api/users/terms', termsRoutes);
app.use('/api/users/saved-projects', savedProjectRoutes);
app.use('/api/users', apiRoutes);

app.use(globalErrorHandlingMiddleware);
