import { globalUploadMiddleware , allowedTo , auth } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers';
import { Plan } from '../models/plan.model';
import { Role } from '../models/role.model';
import { User } from '../models/user.model';
import { Ifeatures } from '../types/Features';
import * as val from '../validators/categoryVal';

export const router = express.Router();

router.get('/crm' , handler.getCatogriesAdminHandler);

router.route('/')
  .post(auth(User) , allowedTo(Plan , Role , Ifeatures.createCategory),globalUploadMiddleware({fileType:'image'}).fields([
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