import { RequestHandler } from 'express';
import { verify } from 'jsonwebtoken';

import { UnauthenticatedError } from '../errors/unauthenticated-error';
import { UnauthorizedError } from '../errors/unauthorized-error';
import { IjwtPayload } from '../types/JwtPayload';

export const isauthenticated: RequestHandler = async (req, res, next) => {
  if (!(req as any).session.access) return next(new UnauthenticatedError({en:'access token not found' , ar: 'الرمز المميز للوصول غير موجود'} , (req as any).lang));

  let payload: IjwtPayload;
  try {
    payload = <IjwtPayload>verify((req as any).session.access, process.env.JWT_KEY!);
    (req as any).loggedUser = payload;
    if ((req as any).loggedUser.isBlocked.value)
      return next(new UnauthorizedError( {
        en: `Forbidden: User is blocked ${(req as any).loggedUser.isBlocked.reason}`,
        ar:` ممنوع: المستخدم محظور ${(req as any).loggedUser.isBlocked.reason}`,
      } , (req as any).lang));
  } catch (error) {
    return res.status(423).json({ message: 'access token expired' });
  }
  next();
};