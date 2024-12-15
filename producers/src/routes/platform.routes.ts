import {
  checkRequiredFields,
  FOLDERS,
  globalPaginationMiddleware,
  globalUploadMiddleware,
  isauthenticated,
  isauthorized,
  PERMISSIONS,
} from '@duvdu-v1/duvdu';
import express from 'express';

import * as controllers from '../controllers/platform';
import * as val from '../validators/platform/platform.val';

export const router = express.Router();

router
  .route('/crm')
  .get(
    isauthenticated,
    isauthorized(PERMISSIONS.getPlatform),
    val.getAll,
    globalPaginationMiddleware,
    controllers.getProducerPlatformsPagination,
    controllers.getCrmPlatformsHandler,
  );

router
  .route('/crm/:platformId')
  .get(
    isauthenticated,
    isauthorized(PERMISSIONS.getPlatform),
    val.getOne,
    controllers.getCrmPlatformHandler,
  );

router
  .route('/')
  .post(
    isauthenticated,
    isauthorized(PERMISSIONS.createPlatform),
    globalUploadMiddleware(FOLDERS.producer, {
      maxSize: 400 * 1024 * 1024,
      fileTypes: ['image/*'],
    }).fields([{ name: 'image', maxCount: 1 }]),
    val.create,
    checkRequiredFields({ fields: ['image'] }),
    controllers.createPlatformHandler,
  )
  .get(
    val.getAll,
    globalPaginationMiddleware,
    controllers.getProducerPlatformsPagination,
    controllers.getPlatformsHandler,
  );

router
  .route('/:platformId')
  .patch(
    isauthenticated,
    isauthorized(PERMISSIONS.updatePlatform),
    globalUploadMiddleware(FOLDERS.producer, {
      maxSize: 400 * 1024 * 1024,
      fileTypes: ['image/*'],
    }).fields([{ name: 'image', maxCount: 1 }]),
    val.update,
    controllers.updatePlatformHandler,
  )
  .get(val.getOne, controllers.getPlatformHandler);
