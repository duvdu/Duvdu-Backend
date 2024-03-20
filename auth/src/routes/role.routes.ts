import { auth , isAuthorized } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as controllers from '../controllers/roles/role.controllers';
import { Roles } from '../models/Role.model';
import { Users } from '../models/User.model';
import { Ifeatures } from '../types/Permissions';
import * as val from '../validators/role/role.validator';

const router = Router();

router
  .route('/')
  .get(auth(Users , Roles), isAuthorized(Ifeatures.getRolesHandler), controllers.getRolesHandler)
  .post(
    auth(Users,Roles),
    isAuthorized(Ifeatures.createRoleHandler),
    val.create,
    controllers.createRoleHandler,
  );

router
  .route('/:roleId')
  .all(auth(Users,Roles))
  .get(isAuthorized(Ifeatures.getRoleHandler), val.roleId, controllers.getRoleHandler)
  .put(
    isAuthorized(Ifeatures.updateRoleHandler),
    val.roleId,
    val.update,
    controllers.updateRoleHandler,
  )
  .delete(
    isAuthorized(Ifeatures.removeRoleHandler),
    val.roleId,
    controllers.removeRoleHandler,
  );

export const roleRoutes = router;
