import { checkRequiredFields, FOLDERS, uploadProjectMedia } from '@duvdu-v1/duvdu';
import express from 'express';


import * as handler from '../controllers/project';
import * as val from '../validators/teamProject.val';



export const router = express.Router();

router.patch('/:projectId/user-action' , val.actionTeamProjectVal , handler.actionTeamProjectHandler);

router.route('/')
  .post(
    uploadProjectMedia(FOLDERS.team_project),
    checkRequiredFields({ fields: ['cover', 'attachments'] }),
    val.createProjectVal,
    handler.createProjectHandler
  );

router.route('/:projectId')
  .patch(uploadProjectMedia(FOLDERS.team_project) , val.updateProjectVal , handler.updateProjectHandler)
  .delete(val.deleteProjectVal , handler.removeProjectHandler)
  .get(val.getProjectHandler,handler.getProjectHandler);


