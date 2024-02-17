import { auth, globalUploadMiddleware } from '@duvdu-v1/duvdu';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import passport from 'passport';

import * as handlers from '../controllers/auth';
import { isAuthorizedMiddleware } from '../middlewares/isAuthorized.middleware';
import { Users } from '../models/User.model';
import { Ifeatures } from '../types/Features';
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
  isAuthorizedMiddleware(Ifeatures.changePassword),
  val.changePasswordVal,
  handlers.changePasswordHandler,
);
router
  .route('/update-phone')
  .all(auth(Users), isAuthorizedMiddleware(Ifeatures.updatePhoneNumber))
  .post(val.askUpdatePhoneVal, handlers.askUpdatePhoneNumberHandler)
  .put(val.updatePhoneNumberVal, handlers.updatePhoneNumberHandler);
router
  .route('/update-phone/verify')
  .post(val.verifyUpdatePhoneVal, handlers.verifyUpdatePhoneNumberHandler);

router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/auth/google/success',
    failureRedirect: '/auth/google/failure',
  }),
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.get('/auth/google/success', (req, res) => {
  console.log('hello here');
});
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
    isAuthorizedMiddleware(Ifeatures.updateProfile),
    globalUploadMiddleware({ fileType: 'image' }).fields([
      { name: 'profileImage', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
    val.updateProfileVal,
    handlers.updateProfileHandler,
  );

router.route('/profile/:userId').get(val.userIdVal, handlers.getUserProfileHandler);

export const apiRoutes = router;
