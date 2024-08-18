import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { query } from 'express-validator';

export const findUsers = [
  query('search').optional(),
  query('username')
    .optional()
    .isLength({ min: 6, max: 32 })
    .withMessage('usernameInvalid')
    .bail()
    .custom((val) => {
      if (val.match(/^[a-z0-9_]+$/)) return true;
      throw new Error('usernameFormat');
    }),
  query('phoneNumber').optional().isMobilePhone('ar-EG').withMessage('phoneNumberInvalid'),
  query('category').optional().isMongoId().withMessage('invalidFormat'),
  query('priceFrom').optional().isFloat({ gt: 0 }).withMessage('invalidFormat').bail().toFloat(),
  query('priceTo')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('invalidFormat')
    .bail()
    .custom((val, { req }) => {
      if (val <= req.query?.priceFrom) throw new Error('invalidFormat');
      return true;
    })
    .bail()
    .toFloat(),
  query('hasVerificationPadge')
    .optional()
    .isBoolean()
    .withMessage('invalidFormat')
    .bail()
    .toBoolean(),
  query('limit').optional().isInt().withMessage('invalidFormat').toInt(),
  query('page').optional().isInt().withMessage('invalidFormat').toInt(),
  query('isAdmin').optional().isBoolean().toBoolean(),
  globalValidatorMiddleware,
];
