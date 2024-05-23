import { FOLDERS, globalPaginationMiddleware, isauthenticated, uploadProjectMedia } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/message';
import * as val from '../validation/message.val';



export const router = express.Router();

router.use(isauthenticated);

router.get('/:receiver/chat/:sender',globalPaginationMiddleware,val.getChatFromToVal, handler.getChatFromToHandler);

router.route('/')
  .post(uploadProjectMedia(FOLDERS.chat),val.sendNessageVal,handler.sendMessageHandler)
  .get(globalPaginationMiddleware , val.gelLoggedUserVal ,handler.getLoggedUserChatsHandler);


router.route('/:receiver/chat')
  .delete( val.deleteChatVal , handler.deleteChatHandler)
  .get(globalPaginationMiddleware,val.getSpecificChatVal,handler.getSpecificChatHandler)
  .patch(val.markMessageAsWatchedVal,handler.markMessageAsWatchedHandler);

router.route('/:message')
  .patch(uploadProjectMedia(FOLDERS.chat),val.updateMessageVal , handler.updateMessageHandler)
  .delete( val.deleteMessageVal , handler.deleteMessageHandler);
