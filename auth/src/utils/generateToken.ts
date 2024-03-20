import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { IjwtPayload } from '../types/JwtPayload';

export const generateToken = (payload: IjwtPayload) =>
  jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.environment === 'development' ? 5 * 24 * 60 * 60 : 60,
  });
