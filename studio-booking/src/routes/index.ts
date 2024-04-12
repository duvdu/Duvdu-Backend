import { checkRequiredFields, isauthenticated, uploadProjectMedia } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/projects';




export const router = express.Router();

router.route('/')
  .post(isauthenticated , 
    uploadProjectMedia(),
    checkRequiredFields({ fields: ['cover', 'attachments'] }),
    handler.createProjectHandler
  );