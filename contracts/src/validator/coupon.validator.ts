import { globalPaginationMiddleware, globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { isFuture, isAfter } from 'date-fns';
import { body, param, query } from 'express-validator';

export const create = [
  body('title.en').isString().notEmpty().withMessage('requiredTitleEn'),
  body('title.ar').isString().notEmpty().withMessage('requiredTitleAr'),
  body('promoCode').isString().notEmpty().withMessage('requiredPromoCode'),
  body('start')
    .isISO8601()
    .withMessage('validStartDate')
    .custom((value) => {
      if (!isFuture(new Date(value))) {
        throw new Error('futureStartDate');
      }
      return true;
    })
    .toDate(),
  body('end')
    .isISO8601()
    .withMessage('validEndDate')
    .custom((value, { req }) => {
      if (!req.body.start) {
        throw new Error('startDateRequired');
      }
      if (!isAfter(new Date(value), new Date(req.body.start))) {
        throw new Error('greaterEndDate');
      }
      return true;
    })
    .toDate(),
  body('couponCount').isInt({ min: 1 }).toInt().withMessage('positiveCouponCount'),
  body('userCount').isInt({ min: 1 }).toInt().withMessage('positiveUserCount'),
  body('value')
    .optional()
    .isFloat({ min: 0 })
    .toFloat()
    .withMessage('positiveMinValue')
    .custom((val, { req }) => {
      if (req.body.percentage) {
        throw new Error('choiceValueOrPercentage');
      }
      return true;
    }),
  body('percentage')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('percentageMinValue')
    .custom((val, { req }) => {
      if (req.body.value) {
        throw new Error('choiceValueOrPercentage');
      }
      return true;
    }),
  globalValidatorMiddleware,
];

export const update = [
  param('couponId').isMongoId().withMessage('validMongoId'),
  body('start')
    .optional()
    .isISO8601()
    .withMessage('validStartDate')
    .custom((value, { req }) => {
      if (!req.body.end) throw new Error('requiredEndDate');
      if (!isFuture(new Date(value))) throw new Error('futureStartDate');
      return true;
    })
    .toDate(),
  body('end')
    .optional()
    .isISO8601()
    .withMessage('validEndDate')
    .custom((value, { req }) => {
      if (!req.body.start) throw new Error('requiredStartDate');
      if (!isAfter(new Date(value), new Date(req.body.start))) throw new Error('greaterEndDate');
      return true;
    })
    .toDate(),
  body('couponCount').optional().isInt({ min: 1 }).toInt().withMessage('positiveCouponCount'),
  body('userCount').optional().isInt({ min: 1 }).toInt().withMessage('positiveUserCount'),
  globalValidatorMiddleware,
];

export const getOne = [
  param('couponId').isMongoId().withMessage('validMongoId'),
  globalPaginationMiddleware,
];

export const getAll = [
  query('limit').optional().isInt({ min: 1 }).withMessage('positiveCouponCount'),
  query('page').optional().isInt({ min: 1 }).withMessage('positiveCouponCount'),
  query('searchKeywords').optional().isArray().withMessage('arrayOfStrings'),
  query('searchKeywords.*').optional().isString().withMessage('stringKeyword'),
  query('startDate').optional().isISO8601().withMessage('validStartDate'),
  query('endDate').optional().isISO8601().withMessage('validEndDate'),
  query('minValue').optional().isFloat({ min: 0 }).withMessage('positiveMinValue'),
  query('maxValue').optional().isFloat({ min: 0 }).withMessage('positiveMaxValue'),
  query('minPercentage').optional().isFloat({ min: 0, max: 100 }).withMessage('percentageMinValue'),
  query('maxPercentage').optional().isFloat({ min: 0, max: 100 }).withMessage('percentageMaxValue'),
  query('promoCode').optional().isString().withMessage('validPromoCode'),
  globalValidatorMiddleware,
];
