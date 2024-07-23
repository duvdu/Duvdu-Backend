import { globalPaginationMiddleware, isauthenticated } from '@duvdu-v1/duvdu';
import express from 'express';

import * as controllers from '../controllers/projectReview';
import * as val from '../validators/projectReview.val';

export const router = express.Router();

router
  .route('/')
  .post(isauthenticated, val.create, controllers.createProjectReviewHandler)
  .get(
    val.getAll,
    globalPaginationMiddleware,
    controllers.getProjectsPagination,
    controllers.getProjectReviewsHandler,
  );

router
  .route('/:reviewId')
  .patch(isauthenticated, val.update, controllers.updateProjectReviewHandler)
  .get(isauthenticated, val.getOne, controllers.getProjectReviewHandler)
  .delete(isauthenticated, val.getOne, controllers.deleteReviewHandler);
