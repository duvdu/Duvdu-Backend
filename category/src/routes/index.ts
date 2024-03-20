import { globalUploadMiddleware , auth , isAuthorized } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { Ifeatures } from '../types/Features';
import * as val from '../validators/categoryVal';

export const router = express.Router();

router.get(
  '/crm',
  auth(User , Role),
  isAuthorized( Ifeatures.getGategoriesAdmin),
  handler.getCatogriesAdminHandler,
);

router
  .route('/')
  .post(
    auth(User , Role),
    isAuthorized( Ifeatures.createCategory),
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
    auth(User , Role),
    isAuthorized( Ifeatures.updateCategory),
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
    auth(User , Role),
    isAuthorized( Ifeatures.removeCategory),
    val.removeCategoryVal,
    handler.removeCategoryHandler,
  );
