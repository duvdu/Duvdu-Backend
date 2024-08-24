import { checkRequiredFields, FOLDERS, globalPaginationMiddleware, globalUploadMiddleware, isauthenticated, isauthorized, PERMISSIONS } from '@duvdu-v1/duvdu';
import express from 'express';

import * as controllers from '../controllers/project';
import * as val from '../validators/projectValidation';

export const router = express.Router();



router.route('/crm').get(isauthenticated , isauthorized(PERMISSIONS.getCrmTeamProjectHandler) , val.getAll , globalPaginationMiddleware , controllers.getProjectsPagination , controllers.getTeamsCrmHandler);
router.route('/crm/:teamId').get(isauthenticated , isauthorized(PERMISSIONS.getCrmTeamProjectHandler),val.getOne , controllers.getCrmTeamHandler);

router.route('/').post(
  isauthenticated,
  isauthorized(PERMISSIONS.createTeamProjectHandler),
  globalUploadMiddleware(FOLDERS.team_project, {
    maxSize: 100 * 1024 * 1024,
    fileTypes: ['video', 'image'],
  }).fields([
    { name: 'creatives[0][users][0][attachments]', maxCount: 10 },
    { name: 'creatives[0][users][1][attachments]', maxCount: 10 },
    { name: 'creatives[0][users][2][attachments]', maxCount: 10 },
    { name: 'creatives[1][users][0][attachments]', maxCount: 10 },
    { name: 'creatives[1][users][1][attachments]', maxCount: 10 },
    { name: 'creatives[1][users][2][attachments]', maxCount: 10 },
    { name: 'cover', maxCount: 1 },
  ]),
  val.create,
  checkRequiredFields({ fields: ['cover'] }),
  controllers.createProjectHandler
)
  .get(  val.getAll , globalPaginationMiddleware , controllers.getProjectsPagination , controllers.getProjectsHandler);

router.route('/:teamId')
  .get( isauthenticated , val.getOne , controllers.getProjectHandler)
  .delete(isauthenticated , val.getOne , controllers.deleteProjectHandler);


router.route('/:teamId/creative')
  .post(
    isauthenticated,
    globalUploadMiddleware(FOLDERS.team_project, {
      maxSize: 100 * 1024 * 1024,
      fileTypes: ['video', 'image'],
    }).fields([
      { name: 'attachments', maxCount: 10 },
    ]) , val.addCreative,  controllers.addCreativeHandler)
  .delete( isauthenticated , val.deleteCreative , controllers.deleteCreativeHandler);