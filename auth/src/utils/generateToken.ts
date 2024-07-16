import { IjwtPayload } from '@duvdu-v1/duvdu';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';

export const generateAccessToken = (payload: IjwtPayload) =>
  jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.environment === 'development' ? '1d': '1h',
  });

export const generateRefreshToken = (payload: { id: string }) =>
  jwt.sign(payload, env.jwt.secret, { expiresIn: '1y' });
