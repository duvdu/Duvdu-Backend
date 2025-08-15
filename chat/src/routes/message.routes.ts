import {
  FOLDERS,
  globalPaginationMiddleware,
  globalUploadMiddleware,
  isauthenticated,
  isauthorized,
  PERMISSIONS,
} from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/message';
import * as val from '../validation/message.val';

export const router = express.Router();

router.use(isauthenticated);

router.route('/avaliable-chat').get(isauthenticated, handler.getAvaliableUserICanChatHandler);

router.get(
  '/:receiver/chat/:sender',
  isauthorized(PERMISSIONS.listMessagesFromTo),
  globalPaginationMiddleware,
  val.getChatFromToVal,
  handler.getChatFromToHandler,
);

router
  .route('/')
  .post(
    globalUploadMiddleware(FOLDERS.chat, {
      fileTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
      maxSize: 100 * 1024 * 1024,
    }).fields([{ name: 'attachments', maxCount: 10 }]),
    val.sendNessageVal,
    handler.sendMessageHandler,
  )
  .get(globalPaginationMiddleware, val.gelLoggedUserVal, handler.getUserChatsHandlerPagination, handler.getLoggedUserChatsHandler);
router.get(
  '/:userId/chats',
  isauthenticated,
  isauthorized(PERMISSIONS.listMessagesFromTo),
  globalPaginationMiddleware,
  val.getUserChatsVal,
  handler.getUserChatsHandler,
);

router
  .route('/:receiver/chat')
  .delete(val.deleteChatVal, handler.deleteChatHandler)
  .get(globalPaginationMiddleware, val.getSpecificChatVal, handler.getSpecificChatHandler)
  .patch(val.markMessageAsWatchedVal, handler.markMessageAsWatchedHandler);

router
  .route('/:message')
  .patch(
    globalUploadMiddleware(FOLDERS.chat, {
      fileTypes: ['image/*', 'video/*', 'audio/*'],
      maxSize: 100 * 1024 * 1024,
    }).fields([{ name: 'attachments', maxCount: 10 }]),
    val.updateMessageVal,
    handler.updateMessageHandler,
  )
  .delete(val.deleteMessageVal, handler.deleteMessageHandler);
