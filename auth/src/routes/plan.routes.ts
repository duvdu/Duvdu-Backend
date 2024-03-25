import { isauthenticated, isauthorized, PERMISSIONS } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as controllers from '../controllers/plans/plan.controllers';
import * as val from '../validators/plan/plan.validator';

const router = Router();

router
  .route('/')
  .post(
    isauthenticated,
    isauthorized(PERMISSIONS.createPlanHandler),
    val.create,
    controllers.createPlanHandler,
  )
  .get(controllers.getPlansHandler);
router
  .route('/all')
  .get(
    isauthenticated,
    isauthorized(PERMISSIONS.getAllPlansHandler),
    controllers.getAllPlansHandler,
  );
router
  .route('/:planId')
  .all(isauthenticated)
  .get(isauthorized(PERMISSIONS.getPlanHandler), val.planId, controllers.getPlanHandler)
  .patch(
    isauthorized(PERMISSIONS.updatePlanHandler),
    val.planId,
    val.update,
    controllers.updatePlanHandler,
  )
  .delete(isauthorized(PERMISSIONS.removePlanHandler), val.planId, controllers.removePlanHandler);

export const planRoutes = router;
