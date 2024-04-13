import { globalPaginationMiddleware, isauthenticated, isauthorized } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as handlers from '../controllers/projects';
import * as val from '../validators/project/project.validator';
const router = Router();

router
  .route('/')
  .get(
    val.findAll,
    globalPaginationMiddleware,
    handlers.getProjectsPagination,
    handlers.getProjectsHandler,
  )
  .post(
    isauthenticated,
    isauthorized('create copyrights post' as any),
    val.create,
    handlers.createProjectHandler,
  );

router.get(
  '/crm',
  isauthenticated,
  isauthorized('get crm copyrights' as any),
  val.findAll,
  globalPaginationMiddleware,
  handlers.getProjectsPagination,
  handlers.getCrmProjectsHandler,
);

router.get(
  '/analysis',
  isauthenticated,
  isauthorized('get copyrights analysis' as any),
  handlers.getProjectAnalysis,
);

router
  .route('/:projectId')
  .get(val.get, handlers.getProjectHandler)
  .patch(
    isauthenticated,
    isauthorized('update copyright post' as any),
    val.update,
    handlers.updateProjectHandler,
  )
  .delete(
    isauthenticated,
    isauthorized('remove copyright post' as any),
    val.get,
    handlers.removeProjectHandler,
  );

export const apiRoutes = router;
