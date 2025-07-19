import {
  globalPaginationMiddleware,
  isauthenticated,
  isauthorized,
  PERMISSIONS,
} from '@duvdu-v1/duvdu';
import express from 'express';

import * as controllers from '../controllers/contractPreview';
import * as val from '../validators/contractReview.val';

export const router = express.Router();

router
  .route('/crm')
  .get(
    isauthenticated,
    isauthorized(PERMISSIONS.listContractsReviews),
    val.getAll,
    globalPaginationMiddleware,
    controllers.getProjectsPagination,
    controllers.getReviewsCrmHandler,
  );

router
  .route('/crm/:reviewId')
  .get(
    isauthenticated,
    isauthorized(PERMISSIONS.listContractsReviews),
    val.getOne,
    controllers.getReviewCrmHandler,
  )
  .delete(
    isauthenticated,
    isauthorized(PERMISSIONS.deleteContractsReviews),
    val.getOne,
    controllers.deleteReviewHandler,
  );

router
  .route('/')
  .post(isauthenticated, val.create, controllers.createReviewHandler)
  .get(
    val.getAll,
    globalPaginationMiddleware,
    controllers.getProjectsPagination,
    controllers.getReviewsHandler,
  );

router
  .route('/:reviewId')
  .get(val.getOne, controllers.getReviewHandler)
  .patch(isauthenticated, val.update, controllers.updateReviewHandler);
