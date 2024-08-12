import { globalPaginationMiddleware, isauthenticated } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/follow';
import * as val from '../validators/follow/index';

export const router = express.Router();

router.get(
  '/user-follower',
  isauthenticated,
  globalPaginationMiddleware,
  handler.getFollowersHandler,
);
router.get(
  '/user-following',
  isauthenticated,
  globalPaginationMiddleware,
  handler.getFollowingHandler,
);
router.patch('/follow-user/:userId', isauthenticated, val.followVal, handler.followHandler);
router.patch('/unfollow-user/:userId', isauthenticated, val.followVal, handler.unFollowHandler);
