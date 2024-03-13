import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { Irole } from '../types/Role';

export const generateToken = (payload: { id: string; role: Irole }) =>
  jwt.sign(payload, env.jwt.secret);
