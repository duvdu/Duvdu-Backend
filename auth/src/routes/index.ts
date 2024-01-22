import { Router } from 'express';

import { signinHandler } from '../controllers/auth/signin.controller';

const router = Router();

router.post('/signin', signinHandler);

export const apiRoutes = router;
