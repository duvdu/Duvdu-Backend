import { isauthenticated, isauthorized, PERMISSIONS } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as controllers from '../controllers/roles/role.controllers';
import * as val from '../validators/role/role.validator';

const router = Router();

router.get(
  '/permissions',
  isauthenticated,
  isauthorized(PERMISSIONS.getAllPermissions),
  controllers.getAllPermissions,
);
router
  .route('/')
  .get(isauthenticated, isauthorized(PERMISSIONS.listRoles), controllers.getRolesHandler)
  .post(
    isauthenticated,
    isauthorized(PERMISSIONS.createRoleHandler),
    val.create,
    controllers.createRoleHandler,
  );

router
  .route('/:roleId')
  .all(isauthenticated)
  .get(isauthorized(PERMISSIONS.listRoles), val.roleId, controllers.getRoleHandler)
  .put(isauthorized(PERMISSIONS.updateRoleHandler), val.update, controllers.updateRoleHandler)
  .delete(isauthorized(PERMISSIONS.removeRoleHandler), val.roleId, controllers.removeRoleHandler);

export const roleRoutes = router;
