import {
  checkRequiredFields,
  FOLDERS,
  globalPaginationMiddleware,
  globalUploadMiddleware,
  isauthenticated,
  optionalAuthenticated,
} from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as handlers from '../controllers/projects_rental';
import * as val from '../validators/rental.validator';

const router = Router();

router
  .route('/')
  .post(
    isauthenticated,
    globalUploadMiddleware(FOLDERS.studio_booking).fields([
      { name: 'attachments', maxCount: 10 },
      { name: 'cover', maxCount: 1 },
    ]),
    checkRequiredFields({ fields: ['cover', 'attachments'] }),
    val.create,
    handlers.createProjectHandler,
  )
  .get(
    optionalAuthenticated,
    val.getAll,
    globalPaginationMiddleware,
    handlers.getProjectsPagination,
    handlers.getProjectsHandler,
  );

router.get('/analysis', isauthenticated, handlers.getProjectAnalysis);

router
  .route('/:projectId')
  .get(optionalAuthenticated, val.getOne, handlers.getProjectHandler)
  .patch(
    isauthenticated,
    globalUploadMiddleware(FOLDERS.studio_booking).fields([
      { name: 'attachments', maxCount: 10 },
      { name: 'cover', maxCount: 1 },
    ]),
    val.update,
    handlers.updateProjectHandler,
  )
  .delete(isauthenticated, val.getOne, handlers.removeProjectHandler);

export const rentalRoutes = router;
