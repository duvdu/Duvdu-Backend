import { RequestHandler } from 'express';
import jwt, { verify } from 'jsonwebtoken';

import { UnauthenticatedError } from '../errors/unauthenticated-error';
import { UnauthorizedError } from '../errors/unauthorized-error';
import { Roles } from '../models/Role.model';
import { Users } from '../models/User.model';
import { IjwtPayload } from '../types/JwtPayload';

export const isauthenticated: RequestHandler = async (req, res, next) => {
  if (!(req as any).session.access)
    return next(
      new UnauthenticatedError(
        { en: 'access token not found', ar: 'الرمز المميز للوصول غير موجود' },
        (req as any).lang,
      ),
    );
  if (!(req as any).session.refresh)
    return next(
      new UnauthenticatedError(
        { en: 'refresh token not found', ar: 'الرمز المميز للوصول غير موجود' },
        (req as any).lang,
      ),
    );

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
    next();
  } catch (error) {
    try {
      const payload = <{ id: string }>verify((req as any).session.refresh, process.env.JWT_KEY!);
      const user = await Users.findOne({
        _id: payload.id,
        refreshTokens: {
          $elemMatch: {
            token: (req as any).session.refresh,
          },
        },
      });
      if (!user) return res.status(423).json({ message: 'token expired' });

      if (user.isBlocked.value)
        return next(
          new UnauthorizedError(
            {
              en: `Forbidden: User is blocked ${(req as any).loggedUser.isBlocked.reason}`,
              ar: ` ممنوع: المستخدم محظور ${(req as any).loggedUser.isBlocked.reason}`,
            },
            (req as any).lang,
          ),
        );

      if (user.isDeleted)
        return next(
          new UnauthorizedError(
            { en: 'user not found', ar: 'لا يوجد مستخدم' },
            (req as any).lang,
          ),
        );

      const role = await Roles.findById(user.role);
      if (!role) return res.status(423).json({ message: 'invalid role' });

      const accessToken = generateAccessToken({
        id: user.id,
        isVerified: user.isVerified,
        isBlocked: user.isBlocked,
        role: { key: role.key, permissions: role.permissions },
      });

      (req as any).session.access = accessToken;
      (req as any).session.refresh = (req as any).session.refresh;
      (req as any).loggedUser = verify(accessToken, process.env.JWT_KEY!) as IjwtPayload;

      next();
    } catch (error) {
      return res.status(423).json({ message: 'token expired' });
    }
  }
};

export const generateAccessToken = (payload: IjwtPayload) =>
  jwt.sign(payload, process.env.JWT_KEY!, {
    expiresIn: process.env.NODE_ENV === 'development' ? '1d' : '1h',
  });
