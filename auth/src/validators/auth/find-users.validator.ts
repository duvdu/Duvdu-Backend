import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { query } from 'express-validator';

export const findUsers = [
  query('search').optional(),
  query('username')
    .optional()
    .isLength({ min: 6, max: 32 })
    .bail()
    .custom((val) => {
      if (val.match(/^[a-z0-9_]+$/)) return true;
      throw new Error('');
    }),
  query('phoneNumber').optional().isMobilePhone('ar-EG'),
  query('category').optional().isMongoId(),
  query('priceFrom').optional().isFloat({ gt: 0 }).bail().toFloat(),
  query('priceTo')
    .optional()
    .isFloat({ gt: 0 })
    .bail()
    .custom((val, { req }) => {
      if (val <= req.querys?.priceFrom) throw new Error('');
      return true;
    })
    .bail()
    .toFloat(),
  query('hasVerificationPadge').optional().isBoolean().bail().toBoolean(),
  query('limit').optional().isInt().toInt(),
  query('page').optional().isInt().toInt(),
  globalValidatorMiddleware,
];
