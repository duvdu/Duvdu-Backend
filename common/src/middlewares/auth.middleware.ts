import 'express-async-errors';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { Model } from 'mongoose';

import { BadRequestError } from '../errors/bad-request-error';
import { GenericError } from '../errors/generic-error';
import { UnauthenticatedError } from '../errors/unauthenticated-error';
import { IjwtPayload } from '../types/JwtPayload';

export const auth = (modelName: Model<any>) => <RequestHandler>(async (req, res, next) => {
  if (!(req as any).session?.jwt) {
    throw new UnauthenticatedError();
  }

  const user = await modelName.findOne({ token: (req as any).session?.jwt });

  if (!user) {
    throw new UnauthenticatedError();
  }

  if (!user.isVerified) {
    throw new UnauthenticatedError('pleas verify your self first');
  }

  if (user.isBlocked) {
    throw new GenericError('the users access is denied due to their blocked status.');
  }

  try {
    const payload = jwt.verify((req as any).session!.jwt, process.env.JWT_KEY!) as IjwtPayload;

    (req as any).user = { id: payload.id };

    return next();
  } catch (error) {
    throw new BadRequestError('invalid or expired token');
  }
});
