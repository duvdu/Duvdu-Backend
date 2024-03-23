import { RequestHandler } from 'express';

import { UnauthorizedError } from '../errors/unauthorized-error';
import { PERMISSIONS } from '../types/Permissions';
import { SystemRoles } from '../types/systemRoles';



export const isauthorized = (permission: PERMISSIONS) => <RequestHandler>(async (
  req,
  res,
  next,
) => {
  if ((req as any).loggedUser.role.key === SystemRoles.admin) return next();
  if (!(req as any).loggedUser.role.permissions.includes(permission)) return next(new UnauthorizedError());
  next();
});