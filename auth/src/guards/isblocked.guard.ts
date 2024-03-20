import { UnauthorizedError } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const isblocked: RequestHandler = async (req, res, next) => {
  if (!req.loggedUser.isBlocked.value)
    return next(new UnauthorizedError(`user is blocked:${req.loggedUser.isBlocked.reason}`));
  next();
};
