import 'express-async-errors';
import { auth } from '@duvdu-v1/duvdu';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import passport from 'passport';

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


router.get('/auth/google', passport.authenticate('google', { scope:
  [ 'email', 'profile' ] }
));


router.get( '/auth/google/callback',
  passport.authenticate( 'google', {
    successRedirect: '/auth/google/success',
    failureRedirect: '/auth/google/failure'
  }));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.get('/auth/google/success' , (req,res)=>{
  console.log('hello here');
});
router
  .route('/reset-password')
  .get(val.askResetPasswordVal, handlers.askResetPasswordHandler)
  .post(val.resetPasswordVal, handlers.resetPasswordHandler);

router.post(
  '/resend-code',
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
    message: 'too many requests, please try again later.',
  }),
  val.resendCodeVal,
  handlers.resendVerificationCodeHandler,
);
router
  .route('/profile')
  .all(auth(Users))
  .get(handlers.getLoggedUserProfileHandler)
  .patch(val.updateProfileVal, handlers.updateProfileHandler);

router.route('/profile/:userId').get(auth(Users), val.userIdVal, handlers.getUserProfileHandler);

export const apiRoutes = router;
