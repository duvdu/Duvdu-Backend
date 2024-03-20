import express from 'express';

import * as handler from '../controllers/terms&condition';
import { isauthenticated } from '../guards/isauthenticated.guard';
import { isauthorized } from '../guards/isauthorized.guard';
import { PERMISSIONS } from '../types/Permissions';
import * as val from '../validators/terms&condition/createTerm.val';

const router = express.Router();

router
  .route('/')
  .post(
    isauthenticated,
    isauthorized(PERMISSIONS.createTerm),
    val.craeteTermVal,
    handler.createTermHandler,
  )
  .get(handler.getTermHandler);

router.put(
  '/:termId',
  isauthenticated,
  isauthorized(PERMISSIONS.updateTerm),
  val.updateTermVal,
  handler.updateTermHandler,
);

export const termsRoutes = router;
