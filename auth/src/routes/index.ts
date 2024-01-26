import 'express-async-errors';
import { auth } from '@duvdu-v1/duvdu';
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
  auth(Users),
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
    message: 'too many requests, please try again later.',
  }),
  val.retreiveUsernameVal,
  handlers.retreiveUsernameHandler,
);
router.patch('/change-password', auth(Users), val.changePasswordVal, handlers.changePassword);
router
  .route('/update-phone')
  .get(auth(Users), val.askUpdatePhoneVal, handlers.askUpdateUserPhoneHandler)
  .put(auth(Users), val.updatePhoneNumberVal, handlers.updatePhoneNumberHandler)
  .post(val.verifyUpdatePhoneVal, handlers.verifyUpdatePhoneNumber);
router
  .route('/reset-password')
  .get(val.askResetPasswordVal, handlers.askResetPassword)
  .post(val.resetPasswordVal, handlers.resetPassword);
router.post('/resend-verify', handlers.resendVerificationCodeHandler);
router.post(
  '/resend-code',
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
    message: 'too many requests, please try again later.',
  }),
  handlers.resendVerificationCodeHandler,
);
router
  .route('/profile')
  .all(auth(Users))
  .get(handlers.getLoggedUserProfileHandler)
  .patch(val.updateProfileVal, handlers.updateProfileHandler);

router.route('/profile/:userId').get(auth(Users), val.userIdVal, handlers.getUserProfileHandler);
export const apiRoutes = router;
