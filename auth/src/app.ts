import { globalErrorHandlingMiddleware } from '@duvdu-v1/duvdu';
import cookieSession from 'cookie-session';
import express from 'express';

import { checkEnvVariables, env } from './../config/env';

export const app = express();
checkEnvVariables();

app.set('trust proxy', true);
app.use(express.json());
app.use(cookieSession({ signed: false, secure: env.environment === 'test' }));

app.use(globalErrorHandlingMiddleware);
