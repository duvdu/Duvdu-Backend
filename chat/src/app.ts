import 'express-async-errors';
import { globalErrorHandlingMiddleware, sessionStore } from '@duvdu-v1/duvdu';
import cors from 'cors';
import express from 'express';
import session from 'express-session';

import { env } from './config/env';

export const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(
  cors({
    origin: ['*' , 'http://localhost:3000'],
    credentials:true,
    exposedHeaders: ['set-cookie']
  }),
);


export const mySession = session({
  secret: env.expressSession.secret,
  resave: false,
  saveUninitialized: false,
  store:
    env.environment !== 'test' && env.expressSession.allowUseStorage
      ? sessionStore(env.redis.uri)
      : undefined,
  cookie: {
    sameSite: 'none',
    secure: env.environment === 'production',
    httpOnly: true,
  },
});

app.use(mySession);
app.use('/api/chat/' , (req,res)=>{
  res.send({d:req.protocol , f:env.environment === 'production'});
});

// app.get('/test', (req, res) => {
//   req.session.jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZGUyYTA5YjMyYjlkZTE1ZDk2MzMwZCIsInBsYW5JZCI6IjY1ZGUyYTA5YjMyYjlkZTE1ZDk2MzMwZiIsImlhdCI6MTcwOTA1OTg4MX0.dLKNTuS_701l72jcs7thSchj1raK6548nxIkGHqEboE';
//   res.send('Session cookie generated successfully.');
// });

app.use(globalErrorHandlingMiddleware);
