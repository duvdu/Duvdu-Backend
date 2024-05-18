// import 'express-async-errors';
// import './types/custom-definition';
// import { globalErrorHandlingMiddleware, sessionStore } from '@duvdu-v1/duvdu';
// import cors from 'cors';
// import express from 'express';
// import session from 'express-session';

// import { env } from './config/env';

// export const app = express();
// app.use(express.json());
// app.set('trust proxy', true);

// app.use(
//   cors({
//     origin: ['*', 'http://localhost:3000', 'http://localhost:3001'],
//     credentials: true,
//     exposedHeaders: ['set-cookie'],
//   }),
// );

// app.use(
//   session({
//     secret: env.expressSession.secret,
//     resave: false,
//     saveUninitialized: false,
//     store:
//       env.environment !== 'test' && env.expressSession.allowUseStorage
//         ? await sessionStore(env.redis.uri, env.redis.pass)
//         : undefined,
//     cookie: {
//       sameSite: 'none',
//       secure: env.environment === 'production',
//       httpOnly: true,
//     },
//   }),
// );

// app.use(globalErrorHandlingMiddleware);
import 'express-async-errors';
import './types/custom-definition';
import { globalErrorHandlingMiddleware, sessionStore } from '@duvdu-v1/duvdu';
import cors from 'cors';
import express from 'express';
import session from 'express-session';

import { env } from './config/env';

// Initialize express app
export const app = express();

// Enable parsing JSON bodies
app.use(express.json());

// Trust the first proxy
app.set('trust proxy', true);

// CORS configuration
const corsOptions = {
  origin: ['*', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  exposedHeaders: ['set-cookie'],
};
app.use(cors(corsOptions));

// Set up session middleware
async function setupSessionMiddleware() {
  if (env.environment !== 'test' && env.expressSession.allowUseStorage) {
    const store = await sessionStore(env.redis.uri, env.redis.pass);
    app.use(
      session({
        secret: env.expressSession.secret,
        resave: false,
        saveUninitialized: false,
        store: store,
        cookie: {
          sameSite: 'none',
          secure: env.environment === 'production',
          httpOnly: true,
        },
      })
    );
  }
}

setupSessionMiddleware().then(() => {

  app.use(globalErrorHandlingMiddleware);
});


