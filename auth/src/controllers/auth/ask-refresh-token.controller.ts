import { NotFound, UnauthenticatedError, Users, Irole } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { verify } from 'jsonwebtoken';

import { env } from '../../config/env';
import { generateAccessToken } from '../../utils/generateToken';

export const askRefreshTokenHandler: RequestHandler = async (req, res, next) => {
  if (!req.session.refresh) return next(new UnauthenticatedError('refresh token not found'));
  let payload: { id: string };
  try {
    payload = <{ id: string }>verify(req.session.refresh, env.jwt.secret);
    const user = await Users.findById(payload.id).populate('role');
    if (!user) return next(new NotFound('user not found'));
    const role = <Irole>user.role;
    const token = generateAccessToken({
      id: user.id,
      isBlocked: user.isBlocked,
      isVerified: user.isVerified,
      role: { key: role.key, permissions: role.permissions },
    });
    req.session.access = token;
    res.status(200).json({ message: 'success' });
  } catch (error) {
    console.error(error);
    return res.status(423).json({ message: 'refresh token expired' });
  }
};
