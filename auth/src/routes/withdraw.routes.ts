import { globalPaginationMiddleware, isauthenticated } from '@duvdu-v1/duvdu';
import express from 'express';

import * as withdrawMethods from '../controllers/withdrawMethods';
import * as withdrawMethodsValidators from '../validators/withDraw';

export const router = express.Router();

router.use(isauthenticated);

router
  .route('/crm')
  .get(
    globalPaginationMiddleware,
    withdrawMethodsValidators.getMethodsValidator,
    withdrawMethods.getMethodsCrm,
  );
router
  .route('/crm/:id')
  .get(withdrawMethodsValidators.getMethodValidator, withdrawMethods.getMethodCrm);

router
  .route('/')
  .post(withdrawMethodsValidators.createMethodValidator, withdrawMethods.createMethod)
  .get(
    globalPaginationMiddleware,
    withdrawMethodsValidators.getMethodsValidator,
    withdrawMethods.getMethods,
  );

router
  .route('/:id')
  .get(withdrawMethodsValidators.getMethodValidator, withdrawMethods.getMethod)
  .put(withdrawMethodsValidators.updateMethodValidator, withdrawMethods.updateMethod)
  .delete(withdrawMethodsValidators.deleteMethodValidator, withdrawMethods.deleteMethod);
