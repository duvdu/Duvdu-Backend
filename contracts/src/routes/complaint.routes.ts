import {
  FOLDERS,
  globalPaginationMiddleware,
  globalUploadMiddleware,
  isauthenticated,
} from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as handlers from '../controllers/complaint';
import * as val from '../validator/complaint.validator';

const router = Router();

router.use(isauthenticated);


router.route('/:contractId').get(val.getOne, handlers.getComplaintHandler);


router
  .route('/')
  .post(
    globalUploadMiddleware(FOLDERS.report, {
      maxSize: 1024 * 1024 * 10, // 10MB
      fileTypes: ['image/*', 'application/pdf'],
    }).fields([
      { name: 'attachments', maxCount: 10 },
    ]),
    val.create,
    handlers.createComplaintHandler,
  )
  .get(
    val.getAll,
    globalPaginationMiddleware,
    handlers.getComplaintsPagination,
    handlers.getComplaintsHandler,
  );

router.post('/:contractId/close', val.close, handlers.closeComplaintHandler);

export const complaintRoutes = router;
