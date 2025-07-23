import {
  globalPaginationMiddleware,
  isauthenticated,
  isauthorized,
  PERMISSIONS,
} from '@duvdu-v1/duvdu';
import express from 'express';

import * as controllers from '../controllers/contractCancel';
import * as validations from '../validator/contractCancel.validation';

export const router = express.Router();
router.use(isauthenticated);

router
  .route('/')
  .post(validations.createContractCancelValidation, controllers.createContractCancel)
  .get(
    isauthorized(PERMISSIONS.listCancelContracts),
    globalPaginationMiddleware,
    validations.getContractsCancelValidation,
    controllers.getContractCancelFilter,
    controllers.getContractsCancel,
  );

router
  .route('/:contractCancelId')
  .get(
    isauthorized(PERMISSIONS.listCancelContracts),
    validations.getContractCancelValidation,
    controllers.getContractCancel,
  )
  .delete(
    isauthorized(PERMISSIONS.deleteCancelContract),
    validations.deleteContractCancelValidation,
    controllers.deleteContractCancel,
  )
  .patch(
    isauthorized(PERMISSIONS.acceptCancelContract),
    validations.acceptContractCancelValidation,
    controllers.acceptContractCancel,
  );
