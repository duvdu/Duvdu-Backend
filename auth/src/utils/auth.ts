import 'express-async-errors';
import { BadRequestError, GenericError, UnauthenticatedError } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { Model } from 'mongoose';

import { IjwtPayload } from '../types/JwtPayload';

export const auth = (modelName: Model<any>) => <RequestHandler>(async (req, res, next) => {
    console.log(modelName);

    console.log((req as any).session?.jwt);
    const user = await modelName.findOne({ token: (req as any).session?.jwt });
    console.log(user);

    if (user.isBlocked) {
      throw new GenericError('the users access is denied due to their blocked status.');
    }

    if (!(req as any).session?.jwt || !user) {
      throw new UnauthenticatedError();
    }

    try {
      const payload = jwt.verify((req as any).session!.jwt, process.env.JWT_KEY!) as IjwtPayload;

      (req as any).user = { id: payload.id };

      return next();
    } catch (error) {
      throw new BadRequestError('invalid or expired token');
    }
  });
