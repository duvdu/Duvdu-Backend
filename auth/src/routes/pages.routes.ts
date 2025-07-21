import { globalPaginationMiddleware, isauthenticated, isauthorized, PERMISSIONS } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as controller from '../controllers/pages';
import * as validator from '../validators/pages';

export const router = Router();
router
  .route('/crm')
  .post(
    isauthenticated,
    isauthorized(PERMISSIONS.createPage),
    validator.createPageValidator,
    controller.createPageController,
  )
  .get(
    isauthenticated,
    isauthorized(PERMISSIONS.listPages),
    globalPaginationMiddleware,
    validator.getPagesValidator,
    controller.getPagesController,
  );
router
  .route('/crm/:id')
  .get(
    isauthenticated,
    isauthorized(PERMISSIONS.listPages),
    validator.getPageValidator,
    controller.getPageController,
  )
  .put(
    isauthenticated,
    isauthorized(PERMISSIONS.updatePage),
    validator.updatePageValidator,
    controller.updatePageController,
  )
  .delete(
    isauthenticated,
    isauthorized(PERMISSIONS.deletePage),
    validator.deletePageValidator,
    controller.deletePageController,
  );

router.route('/').get(globalPaginationMiddleware, validator.getPagesValidator, controller.getPagesController);
router.route('/:id').get( validator.getPageValidator, controller.getPageController);
