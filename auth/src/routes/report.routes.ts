import {
  FOLDERS,
  globalPaginationMiddleware,
  globalUploadMiddleware,
  isauthenticated,
  isauthorized,
  PERMISSIONS,
} from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/report';
import * as val from '../validators/report/report.val';

export const router = express.Router();

router
  .route('/')
  .post(
    isauthenticated,
    globalUploadMiddleware(FOLDERS.studio_booking).fields([{ name: 'attachments', maxCount: 10 }]),
    val.createReportVal,
    handler.createReportHandler,
  )
  .get(
    isauthenticated,
    isauthorized(PERMISSIONS.listReports),
    val.getAllReportsVal,
    globalPaginationMiddleware,
    handler.getReportsPagination,
    handler.getReportsHandler,
  );

router
  .route('/:reportId')
  .patch(
    isauthenticated,
    isauthorized(PERMISSIONS.updateReport),
    val.updateReportVal,
    handler.updateReportHandler,
  )
  .get(
    isauthenticated,
    isauthorized(PERMISSIONS.listReports),
    val.getReportVal,
    handler.getReportHandler,
  )
  .delete(
    isauthenticated,
    isauthorized(PERMISSIONS.deleteReport),
    val.deleteReportVal,
    handler.removeReportHandler,
  );
