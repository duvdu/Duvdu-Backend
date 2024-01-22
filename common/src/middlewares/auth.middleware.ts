import 'express-async-errors';
import { Response, NextFunction , Request } from 'express';
import jwt from 'jsonwebtoken';
import { Model} from 'mongoose';

import { BadRequestError } from '../errors/bad-request-error';
import { UnauthenticatedError } from '../errors/unauthenticated-error';
import { IjwtPayload } from '../types/JwtPayload';



export const auth = (modelName: Model<any>)=>async(req: Request, res: Response, next: NextFunction) => {

  const user = await modelName.find({token:req.session?.jwt});

  if (!req.session?.jwt && !user) {
    throw new UnauthenticatedError();
  }

  try {
    const payload = jwt.verify(req.session!.jwt, process.env.JWT_KEY!) as IjwtPayload;
    req.user = { id: payload.id};
    return next();
  } catch (error) {
    throw new BadRequestError('invalid or expired token');
  }
};