import { globalPaginationMiddleware } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as handlers from '../controllers/sessions';
import * as val from '../validation/session.val';

const router = Router();

// TODO: set authorization permission
router.route('/:userId').get(val.getSession, globalPaginationMiddleware, handlers.getUserSession);

export const sessionRoutes = router;
