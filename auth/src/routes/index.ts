import { RequestHandler, Router } from 'express';
import rateLimit from 'express-rate-limit';

import * as handlers from '../controllers/auth';
import { Users } from '../models/User.model';
import * as val from '../validator';

const router = Router();

router.post('/signin', val.signinVal, handlers.signinHandler as unknown as RequestHandler);
router.post('/signup', val.signupVal, handlers.signupHandler as unknown as RequestHandler);
router.post(
  '/retreive-username',
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
    message: 'too many requests, please try again later.',
  }),
  val.retreiveUsernameVal,
  handlers.retreiveUsernameHandler,
);
router.post('/ask-update-phone' , auth(Users) , val.askUpdatePhoneVal , handlers.askUpdateUserNameHandler);
router.post('/update-phone-number' , auth(Users ), val.updatePhoneNumberVal , handlers.updatePhoneNumberHandler);
router.post('/verify-update-phone' , auth(Users) , val.verifyUpdatePhoneVal , handlers.verifyUpdatePhoneNumber);
export const apiRoutes = router;
