import { checkRequiredFields, FOLDERS, globalUploadMiddleware } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/projects';
import * as val from '../validators/project.val';

export const router = express.Router();



router.route('/').post( 
  globalUploadMiddleware(FOLDERS.portfolio_post).fields([
    { name: 'attachments', maxCount: 10 },
    { name: 'cover', maxCount: 1 },
  ]),
  checkRequiredFields({ fields: ['cover', 'attachments'] }),
  val.create,
  handler.createProjectHandler);