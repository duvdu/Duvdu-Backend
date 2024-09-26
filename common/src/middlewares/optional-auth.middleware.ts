import { RequestHandler } from 'express';
import { verify } from 'jsonwebtoken';

import { UnauthorizedError } from '../errors/unauthorized-error';
import { IjwtPayload } from '../types/JwtPayload';

export const optionalAuthenticated: RequestHandler = async (req, res, next) => {
  if (!(req as any).session.access) return next();

  let payload: IjwtPayload;
  try {
    payload = <IjwtPayload>verify((req as any).session.access, process.env.JWT_KEY!);
    (req as any).loggedUser = payload;
    if ((req as any).loggedUser.isBlocked.value)
      return next(
        new UnauthorizedError(
          {
            en: `Forbidden: User is blocked ${(req as any).loggedUser.isBlocked.reason}`,
            ar: ` ممنوع: المستخدم محظور ${(req as any).loggedUser.isBlocked.reason}`,
          },
          (req as any).lang,
        ),
      );
  } catch (error) {
    return next();
  }
  next();
};
