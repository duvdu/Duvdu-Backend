import { MODELS, globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body, param, query } from 'express-validator';

export const getContracts = [
  query('filter')
    .optional()
    .isString()
    .withMessage('invalidFilter')
    .bail()
    .custom((val) => {
      if (['i_created', 'i_received'].includes(val)) return true;
      throw new Error('invalidFilterValue');
    }),
  globalValidatorMiddleware,
];

export const getContractsCrm = [
  query('ticketNumber').optional().isString().withMessage('invalidTicketNumber'),
  query('filter')
    .optional()
    .isString()
    .withMessage('invalidFilter')
    .bail()
    .custom((val) => {
      if (['i_created', 'i_received'].includes(val)) return true;
      throw new Error('invalidFilterValue');
    }),
  query('ref').optional().isString().withMessage('invalidRef'),
  query('user').optional().isMongoId().withMessage('invalidUser'),
  query('cycle').optional().isString().withMessage('invalidCycle'),
  query('limit').optional().isInt({ min: 1 }).withMessage('invalidLimit'),
  query('from').optional().isISO8601().toDate().withMessage('invalidFrom'),
  query('to').optional().isISO8601().toDate().withMessage('invalidTo'),
  query('page').optional().isInt({ min: 1 }).withMessage('invalidPage'),
  query('project').optional().isMongoId().withMessage('invalidProject'),
  query('status').optional().isString().withMessage('invalidStatus'),
  globalValidatorMiddleware,
];

export const getContract = [
  param('contractId').isMongoId().withMessage('invalidContractId'),
  globalValidatorMiddleware,
];

export const acceptFiles = [
  param('contractId').isMongoId(),
  body('reference')
    .isIn([
      MODELS.projectContract,
      MODELS.teamContract,
      MODELS.copyrightContract,
      MODELS.rentalContract,
    ])
    .withMessage('invalidReference'),
  globalValidatorMiddleware,
];

// export const takeAction = [
//   param('contractId').isMongoId().withMessage('invalidContractId'),
//   body('action')
//     .isString().withMessage('invalidAction')
//     .bail()
//     .custom((val) => {
//       if ([ContractStatus.ongoing, ContractStatus.completed, ContractStatus.rejected].includes(val))
//         return true;
//       throw new Error('invalidActionValue');
//     }),
//   body('submitFiles').optional().isObject().withMessage('invalidSubmitFiles'),
//   body('submitFiles.link').optional().isString().withMessage('invalidSubmitFilesLink'),
//   body('submitFiles.notes').optional().isString().withMessage('invalidSubmitFilesNotes'),
//   globalValidatorMiddleware,
// ];
