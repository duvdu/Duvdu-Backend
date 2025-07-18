import { isauthenticated, isauthorized, PERMISSIONS } from '@duvdu-v1/duvdu';
import express from 'express';

import * as controllers from '../controllers';
import { contractAnalysis } from '../controllers/analysis.controller';
import * as val from '../validator/contract.validator';

export const router = express.Router();

router.use(isauthenticated);

router.get('/crm', isauthorized(PERMISSIONS.listContracts), val.getContractsCrm, controllers.getContractsCrm);
router.get('/crm/analysis', isauthorized(PERMISSIONS.listContractsAnalysis), contractAnalysis);
router.get('/crm/:contractId', isauthorized(PERMISSIONS.listContracts), val.getContract, controllers.getContractCrm);

router.route('/').get(val.getContracts, controllers.getContracts);
router
  .route('/:contractId')
  .get(val.getContract, controllers.getContract)
  .patch(val.acceptFiles, controllers.acceptFilesController);
