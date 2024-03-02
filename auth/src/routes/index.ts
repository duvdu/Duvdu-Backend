import { Router } from 'express';

import { authRoutes } from './auth.routes';
import { oauthRoutes } from './oauth.routes';
import { savedProjectRoutes } from './saved-project.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/oauth', oauthRoutes);
router.use('/saved-projects', savedProjectRoutes);

export const apiRoutes = router;
