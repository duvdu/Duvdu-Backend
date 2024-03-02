import { Router } from 'express';

import { authRoutes } from './auth.routes';
import { oauthRoutes } from './oauth.routes';
import { planRoutes } from './plan.routes';
import { roleRoutes } from './role.routes';
import { savedProjectRoutes } from './saved-project.routes';
import { termsRoutes } from './term';
import { ticketsRoutes } from './ticket';

const router = Router();

router.use('/auth', authRoutes);
router.use('/oauth', oauthRoutes);
router.use('/saved-projects', savedProjectRoutes);
router.use('/terms', termsRoutes);
router.use('/tickets', ticketsRoutes);
router.use('/plans', planRoutes);
router.use('/roles', roleRoutes);

export const apiRoutes = router;
