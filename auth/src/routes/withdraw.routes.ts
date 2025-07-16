import { globalPaginationMiddleware, isauthenticated, isauthorized, PERMISSIONS } from '@duvdu-v1/duvdu';
import express from 'express';

import * as withdrawMethods from '../controllers/withdrawMethods';
import * as withdrawMethodsValidators from '../validators/withDraw';

export const router = express.Router();

router.use(isauthenticated);

router
  .route('/crm')
  .get(
    isauthorized(PERMISSIONS.listWithdrawMethods),
    globalPaginationMiddleware,
    withdrawMethodsValidators.getMethodsValidator,
    withdrawMethods.getMethodsCrmPagination,
    withdrawMethods.getMethodsCrm,
  );
router
  .route('/crm/:id')
  .get(isauthorized(PERMISSIONS.listWithdrawMethods), withdrawMethodsValidators.getMethodValidator, withdrawMethods.getMethodCrm)
  .patch(isauthorized(PERMISSIONS.updateWithdrawMethod), withdrawMethodsValidators.updateMethodValidator, withdrawMethods.updateMethodCrm);

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
  .patch(withdrawMethodsValidators.updateMethodValidator, withdrawMethods.updateMethod)
  .delete(withdrawMethodsValidators.deleteMethodValidator, withdrawMethods.deleteMethod);
