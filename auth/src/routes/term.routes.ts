import { isauthenticated, isauthorized, PERMISSIONS } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/terms&condition';
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
