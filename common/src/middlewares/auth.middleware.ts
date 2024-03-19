import 'express-async-errors';
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { Model } from 'mongoose';

import { GenericError } from '../errors/generic-error';
import { UnauthenticatedError } from '../errors/unauthenticated-error';
import { IjwtPayload } from '../types/JwtPayload';
import { generateToken } from '../utils/generateToken';

export const auth = (User: Model<any> , Roles:Model<any>) => <RequestHandler>(async (req, res, next) => {
  if (!(req as any).session?.jwt) {
    throw new UnauthenticatedError();
  }
  
  const user = await User.findOne({ token: (req as any).session?.jwt });
  
  if (!user) {
    throw new UnauthenticatedError();
  }
  
  if (!user.isVerified.value) {
    throw new UnauthenticatedError(`${user.isVerified.reason}`);
  }
  
  if (user.isBlocked) {
    throw new GenericError('the users access is denied due to their blocked status.');
  }
  try {
    const payload = jwt.verify((req as any).session!.jwt, process.env.JWT_KEY!) as IjwtPayload;

    (req as any).loggedUser = { id: payload.id , permession:payload.permession };

    return next();
  } catch (error) {
    const role = await Roles.findById(user.role);
    
    if (!role) return next(new UnauthenticatedError('user dont have role'));
    const token = generateToken({id:user._id , permession:role.features});
    (req as any).loggedUser = { id: user._id , permession:role.features };
    user.token = token;
    await user.save();
    (req as any).session.jwt = token;
    next();
  }
});