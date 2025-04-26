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

import * as controllers from '../controllers/project';
import * as val from '../validators/projectValidation';

export const router = express.Router();

router
  .route('/crm')
  .get(
    isauthenticated,
    isauthorized(PERMISSIONS.getCrmTeamProjectHandler),
    val.getAll,
    globalPaginationMiddleware,
    controllers.getProjectsPagination,
    controllers.getTeamsCrmHandler,
  );
router
  .route('/crm/:teamId')
  .get(
    isauthenticated,
    isauthorized(PERMISSIONS.getCrmTeamProjectHandler),
    val.getOne,
    controllers.getCrmTeamHandler,
  );

router
  .route('/')
  .post(
    isauthenticated,
    isauthorized(PERMISSIONS.createTeamProjectHandler),
    globalUploadMiddleware(FOLDERS.team_project, {
      maxSize: 100 * 1024 * 1024,
      fileTypes: ['video/*', 'image/*'],
    }).fields([{ name: 'cover', maxCount: 1 }]),
    val.create,
    checkRequiredFields({ fields: ['cover'] }),
    controllers.createProjectHandler,
  )
  .get(
    isauthenticated,
    val.getAll,
    globalPaginationMiddleware,
    controllers.getProjectsPagination,
    controllers.getProjectsHandler,
  );

router
  .route('/:teamId')
  .get(isauthenticated, val.getOne, controllers.getProjectHandler)
  .delete(isauthenticated, val.getOne, controllers.deleteProjectHandler);

router
  .route('/:teamId/contract')
  .post(isauthenticated, val.addContract, controllers.addContractHandler)
  .delete(isauthenticated, val.deleteContract, controllers.deleteContractHandler);

router
  .route('/:teamId/category')
  .post(isauthenticated, val.addCategory, controllers.addCategoryHandler);

router
  .route('/:teamId/category/:categoryId')
  .delete(isauthenticated, val.deleteCategory, controllers.deleteCategoryHandler);
