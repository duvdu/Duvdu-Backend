import { globalPaginationMiddleware, isauthenticated, isauthorized, PERMISSIONS } from '@duvdu-v1/duvdu';
import express from 'express';


import * as handler from '../controllers/producer';
import * as val from '../validators/producer/producer.val';


export const router = express.Router();

router.use(isauthenticated);

router.route('/user')
  .get( handler.getLoggedProducerHandler)
  .delete(handler.deleteLoggedProducerHandler);

router.route('/')
  .post( val.appendProducerVal , handler.appendProducerHandler)
  .get(val.getProducersVal, globalPaginationMiddleware , handler.getProducersPagination,handler.getProducersHandler)
  .patch(val.updateProducerVal , handler.updateProducerHandler);


router.route('/:producerId')
  .get(val.getProducerVal , handler.getProducerHandler)
  .delete(isauthorized(PERMISSIONS.deleteProducerHandler) , val.getProducerVal , handler.deleteProducerHandler); 