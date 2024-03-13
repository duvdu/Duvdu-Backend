import { auth } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as controllers from '../controllers/roles/role.controllers';
import { isAuthorizedMiddleware } from '../middlewares/isAuthorized.middleware';
import { Users } from '../models/User.model';
import { Ifeatures } from '../types/Permissions';
import * as val from '../validators/role/role.validator';

const router = Router();

router
  .route('/')
  .get(auth(Users), isAuthorizedMiddleware(Ifeatures.getRolesHandler), controllers.getRolesHandler)
  .post(
    auth(Users),
    isAuthorizedMiddleware(Ifeatures.createRoleHandler),
    val.create,
    controllers.createRoleHandler,
  );

router
  .route('/:roleId')
  .all(auth(Users))
  .get(isAuthorizedMiddleware(Ifeatures.getRoleHandler), val.roleId, controllers.getRoleHandler)
  .put(
    isAuthorizedMiddleware(Ifeatures.updateRoleHandler),
    val.roleId,
    val.update,
    controllers.updateRoleHandler,
  )
  .delete(
    isAuthorizedMiddleware(Ifeatures.removeRoleHandler),
    val.roleId,
    controllers.removeRoleHandler,
  );

export const roleRoutes = router;
