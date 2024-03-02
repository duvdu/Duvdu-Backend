import { auth } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as controllers from '../controllers/plans/plan.controllers';
import { isAuthorizedMiddleware } from '../middlewares/isAuthorized.middleware';
import { Users } from '../models/User.model';
import { Ifeatures } from '../types/Features';
import * as val from '../validators/plan/plan.validator';

const router = Router();

router
  .route('/')
  .post(
    auth(Users),
    isAuthorizedMiddleware(Ifeatures.createPlanHandler),
    val.create,
    controllers.createPlanHandler,
  )
  .get(controllers.getPlansHandler);
router
  .route('/all')
  .get(
    auth(Users),
    isAuthorizedMiddleware(Ifeatures.getAllPlansHandler),
    controllers.getAllPlansHandler,
  );
router
  .route('/:planId')
  .all(auth(Users))
  .get(isAuthorizedMiddleware(Ifeatures.getPlanHandler), val.planId, controllers.getPlanHandler)
  .patch(
    isAuthorizedMiddleware(Ifeatures.updatePlanHandler),
    val.planId,
    val.update,
    controllers.updatePlanHandler,
  )
  .delete(
    isAuthorizedMiddleware(Ifeatures.removePlanHandler),
    val.planId,
    controllers.removePlanHandler,
  );

export const planRoutes = router;
