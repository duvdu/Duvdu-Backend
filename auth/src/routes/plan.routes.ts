import { auth , isAuthorized } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as controllers from '../controllers/plans/plan.controllers';
import { Roles } from '../models/Role.model';
import { Users } from '../models/User.model';
import { Ifeatures } from '../types/Features';
import * as val from '../validators/plan/plan.validator';

const router = Router();

router
  .route('/')
  .post(
    auth(Users , Roles),
    isAuthorized(Ifeatures.createPlanHandler),
    val.create,
    controllers.createPlanHandler,
  )
  .get(controllers.getPlansHandler);
router
  .route('/all')
  .get(
    auth(Users,Roles),
    isAuthorized(Ifeatures.getAllPlansHandler),
    controllers.getAllPlansHandler,
  );
router
  .route('/:planId')
  .all(auth(Users,Roles))
  .get(isAuthorized(Ifeatures.getPlanHandler), val.planId, controllers.getPlanHandler)
  .patch(
    isAuthorized(Ifeatures.updatePlanHandler),
    val.planId,
    val.update,
    controllers.updatePlanHandler,
  )
  .delete(
    isAuthorized(Ifeatures.removePlanHandler),
    val.planId,
    controllers.removePlanHandler,
  );

export const planRoutes = router;
