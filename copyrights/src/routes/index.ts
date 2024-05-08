import { Router } from 'express';

import { bookingRoutes } from './booking.routes';
import { copyrightRoutes } from './project.routes';

const router = Router();

router.use('/book', bookingRoutes);
router.use('*', copyrightRoutes);

export const apiRoutes = router;
