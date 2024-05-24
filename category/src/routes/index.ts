import {
  isauthorized,
  PERMISSIONS,
  isauthenticated,
  FOLDERS,
  uploadProjectMedia,
  checkRequiredFields,
  globalPaginationMiddleware,
} from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers';
import * as val from '../validators/categoryVal';
//:TODO update permissions
export const router = express.Router();
router.get(
  '/crm',
  isauthenticated,
  isauthorized(PERMISSIONS.getAdminCategories),
  val.getCategoriesForCrmVal,
  globalPaginationMiddleware,
  handler.getCategoriesAdminPagination,
  handler.getCatogriesAdminHandler,
);

router
  .route('/')
  .post(
    isauthenticated,
    isauthorized(PERMISSIONS.createCategory),
    uploadProjectMedia(FOLDERS.category),
    checkRequiredFields({ fields: ['cover'] }),
    val.createCategoryVal,
    handler.createCategoryHandler,
  )
  .get(
    val.getCategoriesVal,
    globalPaginationMiddleware,
    handler.getCategoriesPagination,
    handler.getCategoriesHandler,
  );

router
  .route('/:categoryId')
  .get(val.getCategoryVal, handler.getCategoryHandler)
  .put(
    isauthenticated,
    isauthorized(PERMISSIONS.updateCategory),
    uploadProjectMedia(FOLDERS.category),
    val.updateCategoryVal,
    handler.updateCategoryHandler,
  )
  .delete(
    isauthenticated,
    isauthorized(PERMISSIONS.removeCategory),
    val.removeCategoryVal,
    handler.removeCategoryHandler,
  );
