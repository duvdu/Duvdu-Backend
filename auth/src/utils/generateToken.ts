import jwt from 'jsonwebtoken';

import { env } from '../config/env';

export const generateToken = (payload: { id: string , planId:string }) => jwt.sign(payload, env.jwt.secret);
