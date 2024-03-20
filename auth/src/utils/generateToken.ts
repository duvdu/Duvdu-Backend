import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { Irole } from '../types/Role';

export const generateToken = (payload: { id: string; permession: string[] }) =>
  jwt.sign(payload, env.jwt.secret, {
    expiresIn: '1m',
  });
