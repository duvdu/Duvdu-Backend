import { globalValidatorMiddleware } from '@duvdu-v1/duvdu';
import { body } from 'express-validator';

export const updateProfileVal = [
  body('name')
    .optional()
    .isString().withMessage('nameInvalid')
    .isLength({ min: 3 }).withMessage('nameLength'),
  body('location')
    .optional()
    .isObject()
    .custom(async (val, { req }) => {
      await body('location.lat')
        .isFloat({ min: -90, max: 90 }).withMessage('latInvalid')
        .customSanitizer((val) => +val)
        .run(req);
      await body('location.lng')
        .isFloat({ min: -180, max: 180 }).withMessage('lngInvalid')
        .customSanitizer((val) => +val)
        .run(req);
    }),
  body('address').optional().exists().isString().withMessage('invalidAddress'),
  body('category')
    .optional()
    .isMongoId().withMessage('categoryInvalid'),
  body('about')
    .optional()
    .isString().withMessage('aboutInvalid'),
  body('isAvaliableToInstantProjects').optional().isBoolean().toBoolean().withMessage('isAvaliableInvalid'),
  body('pricePerHour')
    .optional()
    .isFloat().withMessage('priceInvalid')
    .customSanitizer((val) => +val),
  body('password').not().exists().withMessage('passwordNotAllowed'),
  body('username').not().exists().withMessage('usernameNotAllowed'),
  body('phoneNumber').not().exists().withMessage('phoneNumberNotAllowed'),
  body('googleId').not().exists().withMessage('googleIdNotAllowed'),
  body('appleId').not().exists().withMessage('appleIdNotAllowed'),
  body('verificationCode').not().exists().withMessage('verificationCodeNotAllowed'),
  body('isVerified').not().exists().withMessage('isVerifiedNotAllowed'),
  body('token').not().exists().withMessage('tokenNotAllowed'),
  body('acceptedProjectsCounter').not().exists().withMessage('acceptedProjectsCounterNotAllowed'),
  body('profileViews').not().exists().withMessage('profileViewsNotAllowed'),
  body('isOnline').not().exists().withMessage('isOnlineNotAllowed'),
  body('plan').not().exists().withMessage('planNotAllowed'),
  body('hasVerificationPadge').not().exists().withMessage('hasVerificationPadgeNotAllowed'),
  body('avaliableContracts').not().exists().withMessage('avaliableContractsNotAllowed'),
  body('rate').not().exists().withMessage('rateNotAllowed'),
  body('isBlocked').not().exists().withMessage('isBlockedNotAllowed'),
  body('status').not().exists().withMessage('statusNotAllowed'),
  globalValidatorMiddleware,
];
