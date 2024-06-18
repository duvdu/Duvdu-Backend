import { isauthenticated } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as controllers from '../controllers';
import * as val from '../validator/contract.validator';

const router = Router();

router.route('/').get(isauthenticated, val.getContracts, controllers.getContracts);

// router.route('/:contractId').post(isauthenticated, val.takeAction, controllers.takeAction);

export const apiRoutes = router;
