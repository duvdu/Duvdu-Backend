import {
  isauthorized,
  PERMISSIONS,
  isauthenticated,
  FOLDERS,
  checkRequiredFields,
  globalPaginationMiddleware,
  globalUploadMiddleware
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
    globalUploadMiddleware(FOLDERS.category).fields([{ name: 'cover', maxCount: 1 }]),
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

router.get('/sub-categories', handler.getAllSubCategories);

router
  .route('/:categoryId')
  .get(val.getCategoryVal, handler.getCategoryHandler)
  .put(
    isauthenticated,
    isauthorized(PERMISSIONS.updateCategory),
    globalUploadMiddleware(FOLDERS.category).fields([{ name: 'cover', maxCount: 1 }]),
    val.updateCategoryVal,
    handler.updateCategoryHandler,
  )
  .delete(
    isauthenticated,
    isauthorized(PERMISSIONS.removeCategory),
    val.removeCategoryVal,
    handler.removeCategoryHandler,
  );
