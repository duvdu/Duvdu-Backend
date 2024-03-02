import { auth, isAuthorized } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/terms&condition';
import { Plans } from '../models/Plan.model';
import { Roles } from '../models/Role.model';
import { Users } from '../models/User.model';
import { Ifeatures } from '../types/Features';
import * as val from '../validators/terms&condition/createTerm.val';

const router = express.Router();

router
  .route('/')
  .post(
    auth(Users),
    isAuthorized(Plans, Roles, Ifeatures.createTerm),
    val.craeteTermVal,
    handler.createTermHandler,
  )
  .get(handler.getTermHandler);

router.put(
  '/:termId',
  auth(Users),
  isAuthorized(Plans, Roles, Ifeatures.updateTerm),
  val.updateTermVal,
  handler.updateTermHandler,
);

export const termsRoutes = router;
