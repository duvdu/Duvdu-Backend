import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { IjwtPayload } from '../types/JwtPayload';

export const generateAccessToken = (payload: IjwtPayload) =>
  jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.environment === 'development' ? 5 * 24 * 60 * 60 : 60,
  });

export const generateRefreshToken = (payload: { id: string }) =>
  jwt.sign(payload, env.jwt.secret, { expiresIn: '1y' });
