import {
  checkRequiredFields,
  FOLDERS,
  globalPaginationMiddleware,
  globalUploadMiddleware,
  isauthenticated,
  optionalAuthenticated,
} from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as contractHandlers from '../controllers/booking/rental-contract.controller';
import * as handlers from '../controllers/projects_rental';
import * as contractVal from '../validators/booking/contract.validator';
import * as val from '../validators/rental.validator';

const router = Router();

router
  .route('/')
  .post(
    isauthenticated,
    globalUploadMiddleware(FOLDERS.studio_booking).fields([
      { name: 'attachments', maxCount: 10 },
      { name: 'cover', maxCount: 1 },
    ]),
    checkRequiredFields({ fields: ['cover', 'attachments'] }),
    val.create,
    handlers.createProjectHandler,
  )
  .get(
    optionalAuthenticated,
    val.getAll,
    globalPaginationMiddleware,
    handlers.getProjectsPagination,
    handlers.getProjectsHandler,
  );

router.get('/analysis', isauthenticated, handlers.getProjectAnalysis);

router
  .route('/:projectId')
  .get(optionalAuthenticated, val.getOne, handlers.getProjectHandler)
  .patch(
    isauthenticated,
    globalUploadMiddleware(FOLDERS.studio_booking).fields([
      { name: 'attachments', maxCount: 10 },
      { name: 'cover', maxCount: 1 },
    ]),
    val.update,
    handlers.updateProjectHandler,
  )
  .delete(isauthenticated, val.getOne, handlers.removeProjectHandler);

router.post(
  '/:projectId/contract',
  isauthenticated,
  contractVal.create,
  contractHandlers.createContractHandler,
);
router.post(
  '/contract/pay/:paymentSession',
  isauthenticated,
  contractVal.pay,
  contractHandlers.payContract,
);
router.post(
  '/contract/:contractId/action',
  isauthenticated,
  contractVal.action,
  contractHandlers.contractAction,
);

export const rentalRoutes = router;
