import { checkRequiredFields, FOLDERS, globalUploadMiddleware } from '@duvdu-v1/duvdu';
import express from 'express';

import * as controllers from '../controllers/project';
import * as val from '../validators/projectValidation';

export const router = express.Router();

router.route('/').post(
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
  controllers.createProjectHandler,
);
