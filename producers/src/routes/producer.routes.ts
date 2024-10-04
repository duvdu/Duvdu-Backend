import {
  globalPaginationMiddleware,
  isauthenticated,
  isauthorized,
  PERMISSIONS,
} from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/producer';
import * as val from '../validators/producer/producer.val';

export const router = express.Router();

router
  .route('/crm/analysis')
  .get(
    isauthenticated,
    isauthorized(PERMISSIONS.getProducerAnalysis),
    val.getProducerAnalysis,
    handler.getProducerAnalysis,
  );

router
  .route('/user')
  .get(isauthenticated, handler.getLoggedProducerHandler)
  .delete(isauthenticated, handler.deleteLoggedProducerHandler);

router
  .route('/')
  .post(isauthenticated, val.appendProducerVal, handler.appendProducerHandler)
  .get(
    val.getProducersVal,
    globalPaginationMiddleware,
    handler.getProducersPagination,
    handler.getProducersHandler,
  )
  .patch(isauthenticated, val.updateProducerVal, handler.updateProducerHandler);

router
  .route('/:producerId')
  .get(val.getProducerVal, handler.getProducerHandler)
  .delete(isauthenticated, val.getProducerVal, handler.deleteProducerHandler);
