
import { globalErrorHandlingMiddleware, languageHeaderMiddleware, sessionStore } from '@duvdu-v1/duvdu';
import cors from 'cors';
import express from 'express';
import session from 'express-session';

import { env } from './config/env';
import { passport } from './controllers/auth/passport.controller';
import { apiRoutes } from './routes';


export const app = express();

app.use(express.json());

app.set('trust proxy', true);

const corsOptions = {
  origin: ['*', 'http://localhost:3000', 'http://localhost:3001' , 'https://duvdu.com'],
  credentials: true,
  exposedHeaders: ['set-cookie'],
};
app.use(cors(corsOptions));


(async () => {
  const store = await sessionStore(env.redis.uri, env.redis.pass);

  app.use(
    session({
      secret: env.expressSession.secret,
      resave: false,
      saveUninitialized: false,
      store,
      cookie: {
        sameSite: 'none',
        secure: env.environment === 'production',
        httpOnly: true,
      },
    })
  );


  app.use(passport.initialize());
  app.use(passport.session());
  
  app.use(languageHeaderMiddleware);

  app.use('/api/users', apiRoutes);
  
  app.use(globalErrorHandlingMiddleware);
  
})();
  






