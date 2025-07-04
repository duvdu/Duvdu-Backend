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
    isauthorized(PERMISSIONS.getContractsCancel),
    globalPaginationMiddleware,
    validations.getContractsCancelValidation,
    controllers.getContractsCancel,
  );

router
  .route('/:contractCancelId')
  .get(
    isauthorized(PERMISSIONS.getContractsCancel),
    validations.getContractCancelValidation,
    controllers.getContractCancel,
  )
  .delete(
    isauthorized(PERMISSIONS.deleteContractCancel),
    validations.deleteContractCancelValidation,
    controllers.deleteContractCancel,
  )
  .patch(
    isauthorized(PERMISSIONS.acceptContractCancel),
    validations.acceptContractCancelValidation,
    controllers.acceptContractCancel,
  );
