import { RequestHandler, Router } from 'express';
import rateLimit from 'express-rate-limit';

import * as handlers from '../controllers/auth';
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
  handlers.retreiveUsernameHandler as unknown as RequestHandler,
);

export const apiRoutes = router;
