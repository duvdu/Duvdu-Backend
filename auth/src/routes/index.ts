import { auth, globalUploadMiddleware } from '@duvdu-v1/duvdu';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import * as handlers from '../controllers/auth';
import { Users } from '../models/User.model';
import * as val from '../validators';

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
  auth(Users),
  val.changePasswordVal,
  handlers.changePasswordHandler,
);
router
  .route('/update-phone')
  .post(auth(Users), val.askUpdatePhoneVal, handlers.askUpdatePhoneNumberHandler)
  .put(auth(Users), val.updatePhoneNumberVal, handlers.updatePhoneNumberHandler);
router
  .route('/update-phone/verify')
  .post(val.verifyUpdatePhoneVal, handlers.verifyUpdatePhoneNumberHandler);
router
  .route('/reset-password')
  .get(val.askResetPasswordVal, handlers.askResetPasswordHandler)
  .post(val.resetPasswordVal, handlers.resetPasswordHandler);
router.post('/resend-code', val.resendCodeVal, handlers.resendVerificationCodeHandler);
router
  .route('/profile')
  .all(auth(Users))
  .get(handlers.getLoggedUserProfileHandler)
  .patch(
    globalUploadMiddleware({ fileType: 'image' }).fields([
      { name: 'profileImage', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
    val.updateProfileVal,
    handlers.updateProfileHandler,
  );

router.route('/profile/:userId').get(auth(Users), val.userIdVal, handlers.getUserProfileHandler);
export const apiRoutes = router;
