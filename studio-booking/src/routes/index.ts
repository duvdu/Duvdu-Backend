import {
  checkRequiredFields,
  FOLDERS,
  globalPaginationMiddleware,
  isauthenticated,
  isauthorized,
  PERMISSIONS,
  uploadProjectMedia,
} from '@duvdu-v1/duvdu';
import express from 'express';

import { bookProjectHandler } from '../controllers/booking/book-project.controller';
import * as handler from '../controllers/projects';
import { bookProject as bookProjectVal } from '../validators/booking/booking.validator';
import * as val from '../validators/index';

export const router = express.Router();

router
  .route('/')
  .post(
    isauthenticated,
    isauthorized(PERMISSIONS.createStudioProjectHandler),
    uploadProjectMedia(FOLDERS.studio_booking),
    checkRequiredFields({ fields: ['cover', 'attachments'] }),
    val.createProjectVal,
    handler.createProjectHandler,
  )
  .get(
    val.getAllProjectsVal,
    globalPaginationMiddleware,
    handler.getProjectsPagination,
    handler.getProjectsHandler,
  );

router
  .route('/:projectId/equipment/:equipmentId')
  .put(isauthenticated, val.updateEquipmentVal, handler.updateEquipmentHandler)
  .delete(isauthenticated, val.deleteEquipmentVal, handler.deleteEquipmentHandler);

router.get(
  '/crm',
  isauthenticated,
  isauthorized(PERMISSIONS.getCrmStudioProjectsHandlers),
  val.getAllProjectsVal,
  globalPaginationMiddleware,
  handler.getProjectsPagination,
  handler.getCrmProjectsHandler,
);
router.get(
  '/analysis',
  isauthenticated,
  isauthorized(PERMISSIONS.getStudioAnalysisHandler),
  handler.getProjectAnalysis,
);

router
  .route('/:projectId')
  .patch(
    isauthenticated,
    isauthorized(PERMISSIONS.updateStudioProjectHandler),
    uploadProjectMedia(FOLDERS.studio_booking),
    val.updateProjectVal,
    handler.updateProjectHandler,
  )
  .post(isauthenticated, val.addEquipmentVal, handler.addEquipmentHandler)
  .delete(
    isauthenticated,
    isauthorized(PERMISSIONS.removeStudioProjectHandler),
    val.deleteProjectVal,
    handler.removeProjectHandler,
  )
  .get(val.deleteProjectVal, handler.getProjectHandler);

router.post(
  '/book/:projectId',
  isauthenticated,
  isauthorized(PERMISSIONS.booking),
  bookProjectVal,
  bookProjectHandler,
);
