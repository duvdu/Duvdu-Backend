import {
  checkRequiredFields,
  FOLDERS,
  globalPaginationMiddleware,
  globalUploadMiddleware,
  isauthenticated,
  isauthorized,
  optionalAuthenticated,
  PERMISSIONS,
} from '@duvdu-v1/duvdu';
import { RequestHandler, Router } from 'express';

import { contractAction } from '../controllers/booking/contract-action.controller';
import { createContractHandler } from '../controllers/booking/create-contract.controller';
import { payContract } from '../controllers/booking/pay-contract.controller';
import { qrCodeVerificationController } from '../controllers/booking/qrCodeVerification.controller';
import * as handlers from '../controllers/projects_rental';
import * as contractVal from '../validators/booking/contract.validator';
import * as val from '../validators/rental.validator';

const router = Router();

router
  .route('/')
  .post(
    isauthenticated,
    globalUploadMiddleware(FOLDERS.studio_booking, {
      maxSize: 400 * 1024 * 1024,
      fileTypes: ['video/*', 'image/*', 'audio/*', 'application/*'],
    }).fields([
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
    handlers.getProjectsPagination as unknown as RequestHandler,
    handlers.getProjectsHandler,
  );

router.get(
  '/analysis',
  isauthenticated,
  isauthorized((PERMISSIONS as any).getRentalAnalysisHandler),
  handlers.getProjectAnalysis,
);
router.get(
  '/crm',
  isauthenticated,
  isauthorized((PERMISSIONS as any).getCrmRentalProject),
  val.getAll,
  globalPaginationMiddleware,
  handlers.getProjectsPagination as unknown as RequestHandler,
  handlers.getProjectsCrmHandler,
);
router.get(
  '/crm/:projectId',
  isauthenticated,
  isauthorized((PERMISSIONS as any).getCrmRentalProject),
  val.getOne,
  handlers.getProjectCrmHandler,
);

router
  .route('/:projectId')
  .get(optionalAuthenticated, val.getOne, handlers.getProjectHandler)
  .patch(
    isauthenticated,
    globalUploadMiddleware(FOLDERS.studio_booking, {
      maxSize: 400 * 1024 * 1024,
      fileTypes: ['video/*', 'image/*', 'audio/*', 'application/*'],
    }).fields([
      { name: 'attachments', maxCount: 10 },
      { name: 'cover', maxCount: 1 },
    ]),
    val.update,
    handlers.updateProjectHandler,
  )
  .delete(isauthenticated, val.getOne, handlers.removeProjectHandler);

//contract routes
router.post(
  '/contract/:contractId/qr-code-verification',
  isauthenticated,
  contractVal.qrCodeVerification,
  qrCodeVerificationController,
);

router.post(
  '/:projectId/contract',
  isauthenticated,
  globalUploadMiddleware(FOLDERS.studio_booking).array('attachments'),
  contractVal.create,
  createContractHandler,
);
router.post('/contract/pay/:paymentSession', isauthenticated, contractVal.pay, payContract);
router.post('/contract/:contractId/action', isauthenticated, contractVal.action, contractAction);

export const rentalRoutes = router;
