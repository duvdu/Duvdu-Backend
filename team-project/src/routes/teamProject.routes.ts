import { checkRequiredFields, FOLDERS, uploadProjectMedia } from '@duvdu-v1/duvdu';
import express from 'express';


import * as handler from '../controllers/project';
import * as val from '../validators/teamProject.val';



export const router = express.Router();


router.route('/')
  .post(    
    uploadProjectMedia(FOLDERS.team_project),
    checkRequiredFields({ fields: ['cover', 'attachments'] }),
    val.createProjectVal,
    handler.createProjectHandler
  );

