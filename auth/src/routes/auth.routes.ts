import { globalUploadMiddleware } from '@duvdu-v1/duvdu';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import * as handlers from '../controllers/auth';
import { isauthenticated } from '../guards/isauthenticated.guard';
import { isauthorized } from '../guards/isauthorized.guard';
import { PERMISSIONS } from '../types/Permissions';
import * as val from '../validators/auth';

const router = Router();
router.post('/signin', val.signinVal, handlers.signinHandler);
router.post('/signup', val.signupVal, handlers.signupHandler);
router.post(
  '/retreive-username',
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
  }),
  val.retreiveUsernameVal,
  handlers.retreiveUsernameHandler,
);
router.patch(
  '/change-password',
  isauthenticated,
  isauthorized(PERMISSIONS.changePassword),
  val.changePasswordVal,
  handlers.changePasswordHandler,
);
router
  .route('/update-phone')
  .all(isauthenticated, isauthorized(PERMISSIONS.updatePhoneNumber))
  .get(val.askUpdatePhoneVal, handlers.askUpdatePhoneNumberHandler)
  .patch(val.updatePhoneNumberVal, handlers.updatePhoneNumberHandler);

router
  .route('/reset-password/:username')
  .get(val.askResetPasswordVal, handlers.askForgetPasswordHandler)
  .post(val.resetPasswordVal, handlers.updateForgetenPasswordHandler);

router.post('/resend-code', val.resendCodeVal, handlers.resendVerificationCodeHandler);

router
  .route('/profile')
  .all(isauthenticated)
  .get(handlers.getLoggedUserProfileHandler)
  .patch(
    isauthorized(PERMISSIONS.updateProfile),
    globalUploadMiddleware({ fileType: 'image' }).fields([
      { name: 'profileImage', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
    val.updateProfileVal,
    handlers.updateProfileHandler,
  );

router.route('/profile/:userId').get(val.userIdVal, handlers.getUserProfileHandler);

router.route('/verify').post(val.verify, handlers.verifyHandler);

router.route('/refresh').post(handlers.askRefreshTokenHandler);

export const authRoutes = router;
