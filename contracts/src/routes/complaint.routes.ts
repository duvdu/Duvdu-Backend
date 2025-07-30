import {
  FOLDERS,
  globalPaginationMiddleware,
  globalUploadMiddleware,
  isauthenticated,
  isauthorized,
  PERMISSIONS,
} from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as handlers from '../controllers/complaint';
import * as val from '../validator/complaint.validator';

export const router = Router();

router.use(isauthenticated);

router
  .route('/crm')
  .get(
    isauthorized(PERMISSIONS.listComplaints),
    globalPaginationMiddleware,
    val.getAll,
    handlers.getComplaintsPagination,
    handlers.getComplaintsHandler,
  );
router
  .route('/crm/:id/close')
  .patch(isauthorized(PERMISSIONS.closeComplaint), val.close, handlers.closeComplaintHandler);
router
  .route('/crm/:id')
  .get(isauthorized(PERMISSIONS.listComplaints), val.getOne, handlers.getComplaintHandler)
  .patch(
    isauthorized(PERMISSIONS.updateComplaint),
    val.updateComplaint,
    handlers.updateComplaintHandler,
  );

router
  .route('/')
  .post(
    globalUploadMiddleware(FOLDERS.report, {
      maxSize: 1024 * 1024 * 10, // 10MB
      fileTypes: ['image/*', 'application/pdf'],
    }).fields([{ name: 'attachments', maxCount: 10 }]),
    val.create,
    handlers.createComplaintHandler,
  )
  .get(
    val.getAll,
    globalPaginationMiddleware,
    handlers.getComplaintsPagination,
    handlers.getComplaintsHandler,
  );

router.route('/:id').get(val.getOne, handlers.getComplaintHandler);
