import { RequestHandler } from 'express';

import { UnauthorizedError } from '../errors/unauthorized-error';



export const isAuthorized = ( permission:string)=><RequestHandler>(async (req,res,next)=>{    
  if (!(req as any).loggedUser.permession.includes(permission))
    return next(new UnauthorizedError('user not allowed access this route'));
  return next();
});