import 'express-async-errors';
import { BadRequestError , GenericError ,UnauthenticatedError,IjwtPayload } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { Model } from 'mongoose';



export const authc = (modelName: Model<any>) => <RequestHandler>(async (req, res, next) => {
  console.log(req.session);
    
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

    (req as any).loggedUser = { id: payload.id , planId:payload.planId };

    return next();
  } catch (error) {
    throw new BadRequestError('invalid or expired token');
  }
});
