import { FOLDERS, globalUploadMiddleware } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as handlers from '../controllers/complaint';
import * as val from '../validator/complaint.validator';

const router = Router();

router
  .route('/')
  .post(
    globalUploadMiddleware(FOLDERS.report).array('attachments', 10),
    val.create,
    handlers.createComplaintHandler,
  )
  .get(val.getAll, handlers.getComplaintsPagination, handlers.getComplaintsHandler);

router.get('/:complaintId', val.getOne, handlers.getComplaintHandler);
router.post('/:complaintId/close', val.close, handlers.closeComplaintHandler);

export const complaintRoutes = router;
