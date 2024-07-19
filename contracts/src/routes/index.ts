import { isauthenticated } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import { complaintRoutes } from './complaint.routes';
import * as controllers from '../controllers';
import { contractAnalysis } from '../controllers/analysis.controller';
import * as val from '../validator/contract.validator';

const router = Router();
router.get('/analysis', contractAnalysis);

router.route('/').get(isauthenticated, val.getContracts, controllers.getContracts);

router.use('/complaints', complaintRoutes);


router.route('/:contractId').get(isauthenticated, val.getContract, controllers.getContract);

export const apiRoutes = router;
