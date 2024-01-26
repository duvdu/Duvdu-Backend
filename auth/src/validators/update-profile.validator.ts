import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const updateProfileVal = [
  body('name').optional().isString().isLength({ min: 3 }),
  body('profileImage')
    .optional()
    .custom((val, { req }) => {
      if (req.files.profileImage) return true;
      throw new Error();
    }),
  body('coverImage')
    .optional()
    .custom((val, { req }) => {
      if (req.files.coverImage) return true;
      throw new Error();
    }),
  body('location')
    .optional()
    .isObject()
    .custom(async (val, { req }) => {
      await body('location.lat')
        .isFloat({ min: -90, max: 90 })
        .customSanitizer((val) => +val)
        .run(req);
      await body('location.lng')
        .isFloat({ min: -180, max: 180 })
        .customSanitizer((val) => +val)
        .run(req);
    }),
  body('category').optional().isMongoId(),
  body('about').optional().isString(),
  body('isAvaliableToInstantProjects')
    .optional()
    .custom((val) => {
      if (val === 'true' || val === 'false') return true;
      throw new Error('');
    })
    .customSanitizer((val) => (val === 'true' ? true : false)),
  body('pricePerHour')
    .optional()
    .isFloat()
    .customSanitizer((val) => +val),
  globalValidatorMiddleware,
];
