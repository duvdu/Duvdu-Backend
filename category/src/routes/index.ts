import { globalUploadMiddleware } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers';
import * as val from '../validators/categoryVal';

export const router = express.Router();

router.route('/')
  .post(globalUploadMiddleware({fileType:'image'}).fields([
    {
      name:'image' , maxCount:1
    }
  ]) , val.createCategoryVal , handler.createCategoryHandler)
  .get(handler.getCategoriesHandler);

router.route('/:categoryId')
  .get(val.getCatogryVal , handler.getCategoryHandler)
  .put(globalUploadMiddleware({fileType:'image'}).fields([
    {
      name:'image' , maxCount:1
    }
  ]), val.updateCategoryVal , handler.updateCategoryHandler)
  .delete(val.removeCategoryVal , handler.removeCategoryHandler);