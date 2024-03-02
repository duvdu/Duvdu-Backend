/* eslint-disable indent */
import { UnauthenticatedError, UnauthorizedError } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import 'express-async-errors';
import { Roles } from '../models/Role.model';
import { Users } from '../models/User.model';
import { Iplan } from '../types/Plan';

export const isAuthorizedMiddleware = (permission: string) => <RequestHandler>(async (
    req,
    res,
    next,
  ) => {
    const user = await Users.findById(req.loggedUser?.id).populate('plan');
    if (!user) return next(new UnauthenticatedError());
    if (!user.plan) return next(new UnauthorizedError());
    const userPlan = user.plan as Iplan;
    if (userPlan.key === 'admin') return next();
    if (!(await Roles.findOne({ _id: userPlan.role, features: permission })))
      return next(new UnauthorizedError());
    return next();
  });
