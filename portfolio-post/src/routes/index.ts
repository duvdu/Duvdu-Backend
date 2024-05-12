import {
  checkRequiredFields,
  globalPaginationMiddleware,
  PERMISSIONS,
  uploadProjectMedia,
  isauthorized,
  FOLDERS,
  isauthenticated,
} from '@duvdu-v1/duvdu';
import { Router } from 'express';

import { bookProjectHandler } from '../controllers/booking/book-project.controller';
import * as handlers from '../controllers/projects';
import { bookProject as bookProjectVal } from '../validators/booking/booking.validator';
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
    isauthorized(PERMISSIONS.createProtfolioProjectHandler),
    uploadProjectMedia(FOLDERS.portfolio_post),
    checkRequiredFields({ fields: ['cover', 'attachments'] }),
    val.create,
    handlers.createProjectHandler,
  );

router.get(
  '/crm',
  isauthenticated,
  isauthorized(PERMISSIONS.getCrmPortfolioProjectsHandlers as any),
  val.findAll,
  globalPaginationMiddleware,
  handlers.getProjectsPagination,
  handlers.getCrmProjectsHandler,
);

router.get(
  '/analysis',
  isauthenticated,
  isauthorized(PERMISSIONS.getAnalysisHandler as any),
  handlers.getProjectAnalysis,
);

router
  .route('/:projectId')
  .get(val.get, handlers.getProjectHandler)
  .patch(
    isauthenticated,
    isauthorized(PERMISSIONS.updatePortfolioProjectHandler as any),
    uploadProjectMedia(FOLDERS.portfolio_post),
    val.update,
    handlers.updateProjectHandler,
  )
  .delete(
    isauthenticated,
    isauthorized(PERMISSIONS.removePortfolioProjectHandler as any),
    val.get,
    handlers.removeProjectHandler,
  );

router.post(
  '/book/:projectId',
  isauthenticated,
  isauthorized(PERMISSIONS.booking),
  bookProjectVal,
  bookProjectHandler,
);

export const apiRoutes = router;
