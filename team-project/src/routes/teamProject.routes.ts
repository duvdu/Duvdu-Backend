import { checkRequiredFields, FOLDERS, globalPaginationMiddleware, isauthenticated, isauthorized, PERMISSIONS, uploadProjectMedia } from '@duvdu-v1/duvdu';
import express from 'express';


import * as handler from '../controllers/project';
import * as val from '../validators/teamProject.val';



export const router = express.Router();


router.get('/crm' , isauthenticated , isauthorized(PERMISSIONS.getCrmTeamProjectHandler) , val.getProjectsVal , globalPaginationMiddleware , handler.getProjectsCrmHandler);
router.get('/analysis' , isauthenticated , isauthorized(PERMISSIONS.getTeamProjectAnalysisHandler) , val.projectAnalysisVal , globalPaginationMiddleware , handler.getProjectAnalysis);

router.route('/:projectId/user')
  .patch( isauthenticated ,val.actionTeamProjectVal ,  handler.actionTeamProjectHandler)
  .delete( isauthenticated ,val.deleteCreativeVal , handler.deleteCreativeHandler)
  .put(isauthenticated  ,val.updateCreativeVal ,  handler.updateCreativeHandler)
  .post(isauthenticated , val.addCreativeVal ,handler.addCreativeHandler);

router.route('/')
  .post(
    isauthenticated,
    isauthorized(PERMISSIONS.createTeamProjectHandler),
    uploadProjectMedia(FOLDERS.team_project),
    checkRequiredFields({ fields: ['cover', 'attachments'] }),
    val.createProjectVal,
    handler.createProjectHandler
  )
  .get(val.getProjectsVal, globalPaginationMiddleware , handler.getProjectsPagination , handler.getProjectsHandler);

router.route('/:projectId')
  .patch(isauthenticated , isauthorized(PERMISSIONS.updateTeamProjectHandler),uploadProjectMedia(FOLDERS.team_project) , val.updateProjectVal , handler.updateProjectHandler)
  .delete(isauthenticated , isauthorized(PERMISSIONS.deleteTeamProjectHandler) , val.deleteProjectVal , handler.removeProjectHandler)
  .get(val.getProjectVal ,handler.getProjectHandler);


