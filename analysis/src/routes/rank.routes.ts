import {
  globalPaginationMiddleware,
  isauthenticated,
  isauthorized,
  PERMISSIONS,
} from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/rank';
import * as val from '../validators/rank.val';

export const router = express.Router();
router.use(isauthenticated);
router
  .route('/')
  .post(isauthorized(PERMISSIONS.createRank), val.createRankVal, handler.createRankHandler)
  .get(
    isauthorized(PERMISSIONS.listRanks),
    val.validateRanksQuery,
    globalPaginationMiddleware,
    handler.getRanksPagination,
    handler.getRanksHandler,
  );

router
  .route('/:rankId')
  .get(isauthorized(PERMISSIONS.listRanks), val.getRankVal, handler.getRankHandler)
  .patch(isauthorized(PERMISSIONS.updateRank), val.updateRankVal, handler.updateRankHandler)
  .delete(isauthorized(PERMISSIONS.deleteRank), val.deleteRankVal, handler.deleteRankHandler);
