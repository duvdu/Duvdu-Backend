import {
  isauthenticated,
  isauthorized,
  PERMISSIONS,
  globalUploadMiddleware,
  FOLDERS,
} from '@duvdu-v1/duvdu';
import { Router } from 'express';

import { bookProjectHandler } from '../controllers/booking/book-project.controller';
import { updateBookedProjectHandler } from '../controllers/booking/update-booked-project.controller';
import * as val from '../validators/booking/booking.validator';

const router = Router();

router.post(
  '/:projectId',
  isauthenticated,
  isauthorized(PERMISSIONS.booking),
  globalUploadMiddleware(FOLDERS.copyrights, {
    maxSize: 50 * 1024 * 1024,
    fileTypes: ['image', 'video', 'application/pdf', 'text/plain'],
  }).array('attachments', 10),
  val.bookProject,
  bookProjectHandler,
);
router.patch(
  '/:bookingId',
  isauthenticated,
  isauthorized(PERMISSIONS.booking),
  val.updateProject,
  updateBookedProjectHandler,
);

export const bookingRoutes = router;
