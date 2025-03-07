import { CYCLES, globalValidatorMiddleware, SubmitFilesStatus } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const contractFilesValidator = [
  param('contractId').isMongoId(),
  body('link').isURL({ protocols: ['http', 'https'] }),
  body('cycle').isIn([CYCLES.copyRights, CYCLES.portfolioPost, CYCLES.teamProject]),
  body('notes').optional().isString(),
  globalValidatorMiddleware,
];

export const updateContractFileValidator = [
  param('contractId').isMongoId(),
  param('fileId').isMongoId(),
  body('reason').if(body('status').equals(SubmitFilesStatus.rejected)).isString(),
  body('status').optional().isIn([SubmitFilesStatus.approved, SubmitFilesStatus.rejected]),
  body('cycle').isIn([CYCLES.copyRights, CYCLES.portfolioPost, CYCLES.teamProject]),
  globalValidatorMiddleware,
];

export const acceptAllFilesValidator = [
  param('contractId').isMongoId(),
  body('cycle').isIn([CYCLES.copyRights, CYCLES.portfolioPost, CYCLES.teamProject]),
  globalValidatorMiddleware,
];
