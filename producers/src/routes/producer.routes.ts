import { globalPaginationMiddleware, isauthenticated } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/producers';
import * as val from '../validators/producer/producer.val';


export const router = express.Router();


router.route('/')
  .post(isauthenticated,handler.appendProducerHandler)
  .get(val.getProducersVal,globalPaginationMiddleware,handler.getProducersHandler);

router.get('/:producerId' , val.getProducerVal , handler.getProducerHandler);