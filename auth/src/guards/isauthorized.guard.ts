/* eslint-disable indent */
import { UnauthorizedError } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { PERMISSIONS } from '../types/Permissions';
import { SystemRoles } from '../types/Role';

export const isauthorized = (permission: PERMISSIONS) => <RequestHandler>(async (
    req,
    res,
    next,
  ) => {
    if (req.loggedUser.role.key === SystemRoles.admin) return next();
    if (!req.loggedUser.role.permissions.includes(permission)) return next(new UnauthorizedError());
    next();
  });
