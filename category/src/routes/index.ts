import { globalUploadMiddleware  , isauthorized , PERMISSIONS , isauthenticated} from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers';
import * as val from '../validators/categoryVal';

export const router = express.Router();

router.get(
  '/crm',
  isauthenticated,
  isauthorized(PERMISSIONS.getAdminCategories),
  handler.getCatogriesAdminHandler,
);

router
  .route('/')
  .post(
    isauthenticated,
    isauthorized(PERMISSIONS.createCategory),
    globalUploadMiddleware({ fileType: 'image' }).fields([
      {
        name: 'image',
        maxCount: 1,
      },
    ]),
    val.createCategoryVal,
    handler.createCategoryHandler,
  )
  .get(handler.getCategoriesHandler);

router
  .route('/:categoryId')
  .get(val.getCatogryVal, handler.getCategoryHandler)
  .put(
    isauthenticated,
    isauthorized(PERMISSIONS.updateCategory),
    globalUploadMiddleware({ fileType: 'image' }).fields([
      {
        name: 'image',
        maxCount: 1,
      },
    ]),
    val.updateCategoryVal,
    handler.updateCategoryHandler,
  )
  .delete(
    isauthenticated,
    isauthorized(PERMISSIONS.removeCategory),
    val.removeCategoryVal,
    handler.removeCategoryHandler,
  );
