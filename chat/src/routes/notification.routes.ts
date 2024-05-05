import { globalPaginationMiddleware, isauthenticated } from '@duvdu-v1/duvdu';
import express from 'express';


import * as handler from '../controllers/notification';
import * as val from '../validation/notification.val';



export const router = express.Router();

router.use(isauthenticated);
router.route('/')
  .get( globalPaginationMiddleware , val.getAllNotificationVal , handler.getLoggedUserNotificationHandler)
  .patch(handler.updateWatchNotificationHandler);

router.get('/crm',val.getNotificationCrmVal ,globalPaginationMiddleware , handler.getNotificationsPagination , handler.getNotificationsCrmHandler );
router.patch('/:notificationId' , val.updateOneNotificationVal , handler.updateOneWatchNotificationHandler);
