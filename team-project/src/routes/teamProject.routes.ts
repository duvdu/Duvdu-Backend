import { checkRequiredFields, FOLDERS, globalPaginationMiddleware, uploadProjectMedia } from '@duvdu-v1/duvdu';
import express from 'express';


import * as handler from '../controllers/project';
import * as val from '../validators/teamProject.val';



export const router = express.Router();

router.get('/crm' , val.getProjectsVal , globalPaginationMiddleware , handler.getProjectsCrmHandler);
router.get('/analysis' , val.projectAnalysisVal , globalPaginationMiddleware , handler.getProjectAnalysis);

router.route('/:projectId/user')
  .patch( val.actionTeamProjectVal , handler.actionTeamProjectHandler)
  .delete(val.deleteCreativeVal , handler.deleteCreativeHandler);

router.route('/')
  .post(
    uploadProjectMedia(FOLDERS.team_project),
    checkRequiredFields({ fields: ['cover', 'attachments'] }),
    val.createProjectVal,
    handler.createProjectHandler
  )
  .get(val.getProjectsVal, globalPaginationMiddleware , handler.getProjectsPagination , handler.getProjectsHandler);

router.route('/:projectId')
  .patch(uploadProjectMedia(FOLDERS.team_project) , val.updateProjectVal , handler.updateProjectHandler)
  .delete(val.deleteProjectVal , handler.removeProjectHandler)
  .get(val.getProjectVal ,handler.getProjectHandler);


