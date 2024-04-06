import { globalErrorHandlingMiddleware, isauthenticated, sessionStore } from '@duvdu-v1/duvdu';
import express from 'express';
import session from 'express-session';

import { env } from './config/env';

export const app = express();

app.set('trust proxy', true);
app.use(express.json());

app.use(
  session({
    secret: env.expressSession.secret,
    resave: false,
    saveUninitialized: false,
    store:
      env.environment !== 'test' && env.expressSession.allowUseStorage ? sessionStore(env.redis.uri) : undefined,
    cookie: {
      sameSite: 'lax',
      secure: env.environment === 'production',
      httpOnly: true,
    },
  }),
);
app.get('/api/studio-booking' , (req:express.Request, res:express.Response)=>{
  res.send('studio booking work');
});
app.get('/api/studio-booking/test' , isauthenticated , (req:express.Request, res:express.Response)=>{
  res.send('studio booking work');
});
// app.get('/test', (req:express.Request, res:express.Response) => {
//   req.session.access = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZmYzMGQ1YmI5OTUwOTY1ZDQzZGVhZCIsImlzQmxvY2tlZCI6eyJ2YWx1ZSI6ZmFsc2V9LCJpc1ZlcmlmaWVkIjpmYWxzZSwicm9sZSI6eyJrZXkiOiJ1bnZlcmlmaWVkIiwicGVybWlzc2lvbnMiOlsiY2hhbmdlUGFzc3dvcmQiLCJ1cGRhdGVQcm9maWxlIl19LCJpYXQiOjE3MTEyMjI5OTcsImV4cCI6MTcxMTY1NDk5N30.aGkU73UQSr5h34WbA1raJrbYP6VsqYbMhnQl9tYScyw';
//   res.send('Session cookie generated successfully.');
// });
app.use(globalErrorHandlingMiddleware);
