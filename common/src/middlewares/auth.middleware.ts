import { RequestHandler } from 'express';
import { verify } from 'jsonwebtoken';

import { UnauthenticatedError } from '../errors/unauthenticated-error';
import { UnauthorizedError } from '../errors/unauthorized-error';
import { IjwtPayload } from '../types/JwtPayload';

export const isauthenticated: RequestHandler = async (req, res, next) => {
  if (!(req as any).session.access) return next(new UnauthenticatedError('access token not found'));

  let payload: IjwtPayload;
  try {
    payload = <IjwtPayload>verify((req as any).session.access, process.env.JWT_KEY!);
    (req as any).loggedUser = payload;
    if (!(req as any).loggedUser.isBlocked.value)
      return next(new UnauthorizedError(`user is blocked:${(req as any).loggedUser.isBlocked.reason}`));
  } catch (error) {
    return res.status(423).json({ message: 'access token expired' });
  }
  next();
};