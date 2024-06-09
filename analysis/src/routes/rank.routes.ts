import { globalPaginationMiddleware, isauthenticated, isauthorized, PERMISSIONS } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/rank';
import * as val from '../validators/rank.val';


export const router = express.Router();
router.use(isauthenticated);
router.route('/')
  .post( isauthorized(PERMISSIONS.createRankHandler),val.createRankVal , handler.createRankHandler)
  .get(val.validateRanksQuery , globalPaginationMiddleware , handler.getRanksPagination , handler.getRanksHandler);
    
router.route('/:rankId')
  .get(val.getRankVal , handler.getRankHandler)
  .patch(isauthorized(PERMISSIONS.updateRankHandler) , val.updateRankVal , handler.updateRankHandler)
  .delete( isauthorized(PERMISSIONS.deleteRankHandler) , val.deleteRankVal , handler.deleteRankHandler);