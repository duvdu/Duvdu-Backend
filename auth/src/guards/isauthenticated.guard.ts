import { UnauthenticatedError } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { verify } from 'jsonwebtoken';

import { env } from '../config/env';
import { IjwtPayload } from '../types/JwtPayload';

export const isauthenticated: RequestHandler = async (req, res, next) => {
  if (!req.session.access) return next(new UnauthenticatedError('access token not found'));

  let payload: IjwtPayload;
  try {
    payload = <IjwtPayload>verify(req.session.access, env.jwt.secret);
    req.loggedUser = payload;
  } catch (error) {
    return res.status(423).json({ message: 'access token expired' });
  }

  next();
};
