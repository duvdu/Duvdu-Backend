import { checkRequiredFields, FOLDERS, globalPaginationMiddleware, globalUploadMiddleware, isauthenticated, isauthorized, PERMISSIONS } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/projects';
import * as val from '../validators/project.val';

export const router = express.Router();


router.route('/analysis').get(isauthenticated , isauthorized(PERMISSIONS.getAnalysisHandler)  , val.getProjectAnalysis, handler.getProjectAnalysis);
router.route('/crm').get( isauthenticated , isauthorized(PERMISSIONS.getCrmPortfolioProjectsHandlers) , val.getAll , globalPaginationMiddleware , handler.getProjectsPagination, handler.getProjetcsCrm);

router.route('/').post( 
  isauthenticated,
  isauthorized(PERMISSIONS.createProtfolioProjectHandler),
  globalUploadMiddleware(FOLDERS.portfolio_post).fields([
    { name: 'attachments', maxCount: 10 },
    { name: 'cover', maxCount: 1 },
  ]),
  val.create,
  checkRequiredFields({ fields: ['cover', 'attachments'] }),
  handler.createProjectHandler)
  .get(globalPaginationMiddleware , handler.getProjectsPagination , handler.getProjectsHandler);

router.route('/:projectId')
  .patch(
    isauthenticated,
    isauthorized(PERMISSIONS.updatePortfolioProjectHandler),
    globalUploadMiddleware(FOLDERS.portfolio_post).fields([
      { name: 'attachments', maxCount: 10 },
      { name: 'cover', maxCount: 1 },
    ]),
    val.update,
    handler.updateProjectHandler
  )
  .get(val.getProject , handler.getProjectHandler)
  .delete(isauthenticated , isauthorized(PERMISSIONS.removePortfolioProjectHandler) , val.getProject , handler.deleteProjectHandler);