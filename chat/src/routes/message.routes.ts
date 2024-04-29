import { FOLDERS, isauthenticated, uploadProjectMedia } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/message';
import * as val from '../validation/message.val';



export const router = express.Router();

router.use(isauthenticated);
router.route('/')
  .post(uploadProjectMedia(FOLDERS.chat),val.sendNessageVal,handler.sendMessageHandler);

router.route('/:receiver/chat')
  .delete( val.deleteChatVal , handler.deleteChatHandler);

router.route('/:message')
  .patch(uploadProjectMedia(FOLDERS.chat),val.updateMessageVal , handler.updateMessageHandler)
  .delete( val.deleteMessageVal , handler.deleteMessageHandler);

