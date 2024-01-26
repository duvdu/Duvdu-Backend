// import { auth } from '@duvdu-v1/duvdu';
import 'express-async-errors';
import { auth } from '@duvdu-v1/duvdu';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import * as handlers from '../controllers/auth';
import { Users } from '../models/User.model';
import * as val from '../validator';

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

router
  .route('/update-phone-number')
  .get(auth(Users), val.askUpdatePhoneVal, handlers.askUpdateUserPhoneHandler)
  .post(auth(Users), val.updatePhoneNumberVal, handlers.updatePhoneNumberHandler)
  .put(val.verifyUpdatePhoneVal, handlers.verifyUpdatePhoneNumber);

router.put('/change-password', auth(Users), val.changePasswordVal, handlers.changePassword);

router
  .route('/reset-password')
  .get(val.askResetPasswordVal, handlers.askResetPassword)
  .put(val.resetPasswordVal, handlers.resetPassword);
export const apiRoutes = router;
