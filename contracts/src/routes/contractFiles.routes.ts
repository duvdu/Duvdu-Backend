import { isauthenticated } from '@duvdu-v1/duvdu';
import express from 'express';

import * as controller from '../controllers/contractFiles';
import * as validator from '../validator/contractFiles.validator';

export const router = express.Router();

router.use(isauthenticated);

router
  .route('/:contractId')
  .post(validator.contractFilesValidator, controller.addContractFileController);

router
  .route('/:contractId/:fileId')
  .patch(validator.updateContractFileValidator, controller.updateContractFileController);
