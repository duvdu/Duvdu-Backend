import {
  globalPaginationMiddleware,
  isauthenticated,
  isauthorized,
  PERMISSIONS,
} from '@duvdu-v1/duvdu';
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
    isauthorized(PERMISSIONS.createCopyrightHandler),
    val.create,
    handlers.createProjectHandler,
  );

router.get(
  '/crm',
  isauthenticated,
  isauthorized(PERMISSIONS.getCrmCopyrightsHandlers),
  val.findAll,
  globalPaginationMiddleware,
  handlers.getProjectsPagination,
  handlers.getCrmProjectsHandler,
);

router.get(
  '/analysis',
  isauthenticated,
  isauthorized(PERMISSIONS.getCopyrightAnalysisHandler),
  handlers.getProjectAnalysis,
);

router
  .route('/:projectId')
  // .get(val.get, handlers.getProjectHandler)
  .patch(
    isauthenticated,
    isauthorized(PERMISSIONS.updateCopyrightHandler),
    val.update,
    handlers.updateProjectHandler,
  )
  .delete(
    isauthenticated,
    isauthorized(PERMISSIONS.removeCopyrightHandler),
    val.get,
    handlers.removeProjectHandler,
  );

export const copyrightRoutes = router;
