import { RequestHandler } from 'express';
import { Model } from 'mongoose';

import { UnauthorizedError } from '../errors/unauthorized-error';



export const isAuthorized = (planModel:Model<any>,roleMode:Model<any> , permission:string)=><RequestHandler>(async (req,res,next)=>{    
  const plan = await planModel.findById((req as any).loggedUser?.planId);  
  if (!plan) return next(new UnauthorizedError('user dont have plain'));
  const role = await roleMode.findById(plan.role);
  
  if (!role) return next(new UnauthorizedError('user dont have this role'));

  if (!role.features.includes(permission)) return next(new UnauthorizedError('user not allowed access this route'));
  return next();
});