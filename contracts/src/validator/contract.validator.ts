import { ContractStatus, globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';



export const getContracts = [
  query('filter')
    .optional()
    .isString().withMessage('invalidFilter')
    .bail()
    .custom((val) => {
      if (['i_created', 'i_received'].includes(val)) return true;
      throw new Error('invalidFilterValue');
    }),
  globalValidatorMiddleware,
];

export const getContract = [param('contractId').isMongoId().withMessage('invalidContractId'), globalValidatorMiddleware];

export const takeAction = [
  param('contractId').isMongoId().withMessage('invalidContractId'),
  body('action')
    .isString().withMessage('invalidAction')
    .bail()
    .custom((val) => {
      if ([ContractStatus.ongoing, ContractStatus.completed, ContractStatus.rejected].includes(val))
        return true;
      throw new Error('invalidActionValue');
    }),
  body('submitFiles').optional().isObject().withMessage('invalidSubmitFiles'),
  body('submitFiles.link').optional().isString().withMessage('invalidSubmitFilesLink'),
  body('submitFiles.notes').optional().isString().withMessage('invalidSubmitFilesNotes'),
  globalValidatorMiddleware,
];

