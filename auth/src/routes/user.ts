import { auth, globalUploadMiddleware } from '@duvdu-v1/duvdu';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import * as handlers from '../controllers/auth';
import passport from '../controllers/auth/googleAuth.controller';
import { Users } from '../models/User.model';
import { Iuser } from '../types/User';
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

router.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile', 'phone'] }),
);

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/api/users/auth/google/success',
    failureRedirect: '/auth/google/failure',
  }),
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.get('/auth/google/success', (req, res) => {
  console.log('hello here');
  req.session.jwt = (req.user as Iuser)?.token;
  res.send('helllo metoo');
});

router.get('/auth/apple', passport.authenticate('apple'));

router.get(
  '/auth/apple/callback',
  passport.authenticate('apple', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to the desired page
    res.redirect('/profile');
  },
);

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
