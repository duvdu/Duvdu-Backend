import { FOLDERS, uploadProjectMedia } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/message';




export const router = express.Router();


router.route('/')
  .post(uploadProjectMedia(FOLDERS.report),handler.sendMessageHandler);