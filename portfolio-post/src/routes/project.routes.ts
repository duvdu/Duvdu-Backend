import {
  checkRequiredFields,
  FOLDERS,
  globalPaginationMiddleware,
  globalUploadMiddleware,
  isauthenticated,
  isauthorized,
  optionalAuthenticated,
  PERMISSIONS,
} from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/project';
import * as val from '../validators/project.val';

export const router = express.Router();

router
  .route('/analysis')
  .get(
    isauthenticated,
    isauthorized(PERMISSIONS.getAnalysisHandler),
    val.getProjectAnalysis,
    handler.getProjectAnalysis,
  );
router
  .route('/crm')
  .get(
    isauthenticated,
    isauthorized(PERMISSIONS.getCrmProjectsHandlers),
    val.getAll,
    globalPaginationMiddleware,
    handler.getProjectsPagination,
    handler.getProjetcsCrm,
  );

router
  .route('/')
  .post(
    isauthenticated,
    isauthorized(PERMISSIONS.createProjectHandler),
    globalUploadMiddleware(FOLDERS.portfolio_post, {
      maxSize: 400 * 1024 * 1024,
      fileTypes: ['video', 'image', 'audio/wav' , 'audio/mpeg' , 'application/pdf'],
    }).fields([
      { name: 'attachments', maxCount: 10 },
      { name: 'cover', maxCount: 1 },
    ]),
    val.create,
    checkRequiredFields({ fields: ['cover', 'attachments'] }),
    handler.createProjectHandler,
  )
  .get(optionalAuthenticated,globalPaginationMiddleware, handler.getProjectsPagination, handler.getProjectsHandler);

router
  .route('/:projectId')
  .patch(
    isauthenticated,
    isauthorized(PERMISSIONS.updateProjectHandler),
    globalUploadMiddleware(FOLDERS.portfolio_post, {
      maxSize: 400 * 1024 * 1024,
      fileTypes: ['video', 'image', 'audio/wav' , 'audio/mpeg' , 'application/pdf'],
    }).fields([
      { name: 'attachments', maxCount: 10 },
      { name: 'cover', maxCount: 1 },
    ]),
    val.update,
    handler.updateProjectHandler,
  )
  .get(optionalAuthenticated,val.getProject, handler.getProjectHandler)
  .delete(
    isauthenticated,
    isauthorized(PERMISSIONS.removeProjectHandler),
    val.getProject,
    handler.deleteProjectHandler,
  );
