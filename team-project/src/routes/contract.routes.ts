import { isauthenticated } from '@duvdu-v1/duvdu';
import express from 'express';

import * as controllers from '../controllers/contract';
import * as val from '../validators/projectValidation';

export const router = express.Router();

router.use(isauthenticated);

router.route('/:contractId').post(val.action, controllers.contractAction);
router.post('/pay/:paymentSession', val.pay, controllers.payContract);
