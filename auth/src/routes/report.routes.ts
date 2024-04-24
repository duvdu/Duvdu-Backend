import { uploadProjectMedia, FOLDERS, globalPaginationMiddleware, isauthenticated, isauthorized, PERMISSIONS } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/report';
import * as val from '../validators/report/report.val';

export const router = express.Router();



router.route('/')
  .post(isauthenticated ,uploadProjectMedia(FOLDERS.studio_booking),val.createReportVal,handler.createReportHandler)
  .get(globalPaginationMiddleware , isauthenticated , isauthorized(PERMISSIONS.getAllReportsHandler) , handler.getReportsPagination , handler.getReportsHandler);

router.route('/:reportId')
  .patch(isauthenticated ,isauthorized(PERMISSIONS.updateReportHandler) ,handler.updateReportHandler)
  .get(isauthenticated , isauthorized(PERMISSIONS.getReportHandler),handler.getReportHandler)
  .delete(isauthenticated , isauthorized(PERMISSIONS.deleteReportHandler),handler.getReportHandler);