import { Router } from 'express';

import { authRoutes } from './auth.routes';
import { bookmarkRoutes } from './bookmark.routes';
import { router as followRouter } from './follow.routes';
import { oauthRoutes } from './oauth.routes';
import { planRoutes } from './plan.routes';
import { router as reportRoutes } from './report.routes';
import { roleRoutes } from './role.routes';
import { termsRoutes } from './term.routes';
import { ticketsRoutes } from './ticket.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/oauth', oauthRoutes);
router.use('/saved-projects', bookmarkRoutes);
router.use('/terms', termsRoutes);
router.use('/tickets', ticketsRoutes);
router.use('/plans', planRoutes);
router.use('/roles', roleRoutes);
router.use('/report', reportRoutes);
router.use('/follow', followRouter);

export const apiRoutes = router;
