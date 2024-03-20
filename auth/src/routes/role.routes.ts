import { Router } from 'express';

import * as controllers from '../controllers/roles/role.controllers';
import { isauthenticated } from '../guards/isauthenticated.guard';
import { isauthorized } from '../guards/isauthorized.guard';
import { PERMISSIONS } from '../types/Permissions';
import * as val from '../validators/role/role.validator';

const router = Router();

router
  .route('/')
  .get(isauthenticated, isauthorized(PERMISSIONS.getRolesHandler), controllers.getRolesHandler)
  .post(
    isauthenticated,
    isauthorized(PERMISSIONS.createRoleHandler),
    val.create,
    controllers.createRoleHandler,
  );

router
  .route('/:roleId')
  .all(isauthenticated)
  .get(isauthorized(PERMISSIONS.getRoleHandler), val.roleId, controllers.getRoleHandler)
  .put(
    isauthorized(PERMISSIONS.updateRoleHandler),
    val.roleId,
    val.update,
    controllers.updateRoleHandler,
  )
  .delete(isauthorized(PERMISSIONS.removeRoleHandler), val.roleId, controllers.removeRoleHandler);

export const roleRoutes = router;
