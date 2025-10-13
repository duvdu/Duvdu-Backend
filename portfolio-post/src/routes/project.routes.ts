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
  .route('/tagged')
  .get(isauthenticated, globalPaginationMiddleware, handler.getUserTaggedProjectsHandler);

router
  .route('/:projectId/tagged-creative/:creativeId')
  .delete(isauthenticated, val.removeTaggedCreative, handler.removeTaggedCreative);

router
  .route('/analysis')
  .get(
    isauthenticated,
    isauthorized(PERMISSIONS.getProjectAnalysis),
    val.getProjectAnalysis,
    handler.getProjectAnalysis,
  );
router
  .route('/crm')
  .get(
    isauthenticated,
    isauthorized(PERMISSIONS.listProjects),
    globalPaginationMiddleware,
    val.getAll,
    handler.getProjectsPagination,
    handler.getProjetcsCrm,
  );

router
  .route('/crm/:projectId')
  .get(
    isauthenticated,
    isauthorized(PERMISSIONS.listProjects),
    globalPaginationMiddleware,
    val.getProject,
    handler.getProjectCrmHandler,
  )
  .patch(
    isauthenticated,
    isauthorized(PERMISSIONS.updateProject),
    globalUploadMiddleware(FOLDERS.portfolio_post, {
      maxSize: 400 * 1024 * 1024,
      fileTypes: ['video/*', 'image/*', 'audio/*', 'audio/wav', 'audio/x-wav', 'application/*'],
    }).fields([
      { name: 'attachments', maxCount: 10 },
      { name: 'cover', maxCount: 1 },
      { name: 'audioCover', maxCount: 1 },
    ]),
    val.update,
    handler.updateProjectCrmHandler,
  )
  .delete(
    isauthenticated,
    isauthorized(PERMISSIONS.removeProject),
    val.getProject,
    handler.deleteProjectCrmHandler,
  );

router
  .route('/')
  .post(
    isauthenticated,
    globalUploadMiddleware(FOLDERS.portfolio_post, {
      maxSize: 400 * 1024 * 1024,
      fileTypes: ['video/*', 'image/*', 'audio/*', 'audio/wav', 'audio/x-wav', 'application/*'],
    }).fields([
      { name: 'attachments', maxCount: 10 },
      { name: 'cover', maxCount: 1 },
      { name: 'audioCover', maxCount: 1 },
    ]),
    val.create,
    checkRequiredFields({ fields: ['cover', 'attachments'] }),
    handler.createProjectHandler,
  )
  .get(
    optionalAuthenticated,
    globalPaginationMiddleware,
    val.getAll,
    handler.getProjectsPagination,
    handler.getProjectsHandler,
  );

router
  .route('/:projectId')
  .patch(
    isauthenticated,
    globalUploadMiddleware(FOLDERS.portfolio_post, {
      maxSize: 400 * 1024 * 1024,
      fileTypes: ['video/*', 'image/*', 'audio/*', 'audio/wav', 'audio/x-wav', 'application/*'],
    }).fields([
      { name: 'attachments', maxCount: 10 },
      { name: 'cover', maxCount: 1 },
      { name: 'audioCover', maxCount: 1 },
    ]),
    val.update,
    handler.updateProjectHandler,
  )
  .get(optionalAuthenticated, val.getProject, handler.getProjectHandler)
  .delete(isauthenticated, val.getProject, handler.deleteProjectHandler)
  .post(isauthenticated, val.acceptAction, handler.invitationActionHandler);
