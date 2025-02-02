import { CYCLES, globalValidatorMiddleware, SubmitFilesStatus } from '@duvdu-v1/duvdu';
import { body, param } from 'express-validator';

export const contractFilesValidator = [
  body('link').isURL().notEmpty(),
  body('cycle').isIn([CYCLES.copyRights, CYCLES.portfolioPost, CYCLES.teamProject]),
  body('notes').optional().isString(),
  globalValidatorMiddleware,
];

export const updateContractFileValidator = [
  param('contractId').isString().notEmpty(),
  param('fileId').isString().notEmpty(),
  body('link').optional().isURL(),
  body('notes').optional().isString(),
  body('reason').if(body('status').equals(SubmitFilesStatus.rejected)).isString(),
  body('status').optional().isIn([SubmitFilesStatus.approved, SubmitFilesStatus.rejected]),
  body('cycle').isIn([CYCLES.copyRights, CYCLES.portfolioPost, CYCLES.teamProject]),
  globalValidatorMiddleware,
];
