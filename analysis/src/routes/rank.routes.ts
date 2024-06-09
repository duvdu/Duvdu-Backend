import { globalPaginationMiddleware } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/rank';
import * as val from '../validators/rank.val';


export const router = express.Router();

router.route('/')
  .post( val.createRankVal , handler.createRankHandler)
  .get(val.validateRanksQuery , globalPaginationMiddleware , handler.getRanksPagination , handler.getRanksHandler);
    
router.route('/:rankId')
  .get(val.getRankVal , handler.getRankHandler)
  .patch( val.updateRankVal , handler.updateRankHandler)
  .delete( val.deleteRankVal , handler.deleteRankHandler);