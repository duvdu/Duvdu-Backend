import { ContractStatus, globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const getContracts = [
  query('filter')
    .optional()
    .isString()
    .bail()
    .custom((val) => {
      if (['i_created', 'i_received'].includes(val)) return true;
      throw new Error('');
    }),
  globalValidatorMiddleware,
];

export const getContract = [param('contractId').isMongoId(), globalValidatorMiddleware];

export const takeAction = [
  param('contractId').isMongoId(),
  body('action')
    .isString()
    .bail()
    .custom((val) => {
      if ([ContractStatus.ongoing, ContractStatus.completed, ContractStatus.rejected].includes(val))
        return true;
      throw new Error();
    }),
  body('submitFiles').optional().isObject(),
  body('submitFiles.link').optional().isString(),
  body('submitFiles.notes').optional().isString(),
  globalValidatorMiddleware,
];
