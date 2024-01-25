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
router.post(
  '/ask-update-phone',
  auth(Users),
  val.askUpdatePhoneVal,
  handlers.askUpdateUserPhoneHandler,
);
router.post(
  '/update-phone-number',
  auth(Users),
  val.updatePhoneNumberVal,
  handlers.updatePhoneNumberHandler,
);
router.post(
  '/verify-update-phone',
  val.verifyUpdatePhoneVal,
  handlers.verifyUpdatePhoneNumber,
);
export const apiRoutes = router;
