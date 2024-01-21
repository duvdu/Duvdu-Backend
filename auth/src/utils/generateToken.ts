import jwt from 'jsonwebtoken';

import { env } from '../config/env';

export const generateToken = (payload: { id: string }) =>
  jwt.sign(payload, env.jwt.secret, { expiresIn: '10d' });
