import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { check } from 'express-validator';

export const createTermVal = [
  check('desc.en').exists().isString().notEmpty().withMessage('descRequired'),
  check('desc.ar').exists().isString().notEmpty().withMessage('descRequired'),
  check('refundPolicy.en').exists().isString().notEmpty().withMessage('refundPolicyRequired'),
  check('refundPolicy.ar').exists().isString().notEmpty().withMessage('refundPolicyRequired'),
  check('privacyPolicy.en').exists().isString().notEmpty().withMessage('privacyPolicyRequired'),
  check('privacyPolicy.ar').exists().isString().notEmpty().withMessage('privacyPolicyRequired'),
  globalValidatorMiddleware,
];

export const updateTermVal = [
  check('termId').isMongoId().withMessage('termIdInvalid'),
  check('desc.en')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('descRequired')
    .custom(async (value, { req }) => {
      if (!req.body.desc.ar) {
        throw new Error('descRequired');
      }
    }),
  check('desc.ar')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('descRequired')
    .custom(async (value, { req }) => {
      if (!req.body.desc.en) {
        throw new Error('descRequired');
      }
    }),
  check('refundPolicy.en')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('refundPolicyRequired')
    .custom(async (value, { req }) => {
      if (!req.body.refundPolicy.ar) {
        throw new Error('refundPolicyRequired');
      }
    }),
  check('refundPolicy.ar')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('refundPolicyRequired')
    .custom(async (value, { req }) => {
      if (!req.body.refundPolicy.en) {
        throw new Error('refundPolicyRequired');
      }
    }),
  check('privacyPolicy.ar')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('privacyPolicyRequired')
    .custom(async (value, { req }) => {
      if (!req.body.privacyPolicy.en) {
        throw new Error('privacyPolicyRequired');
      }
    }),
  check('privacyPolicy.en')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('privacyPolicyRequired')
    .custom(async (value, { req }) => {
      if (!req.body.privacyPolicy.ar) {
        throw new Error('privacyPolicyRequired');
      }
    }),
  globalValidatorMiddleware,
];
