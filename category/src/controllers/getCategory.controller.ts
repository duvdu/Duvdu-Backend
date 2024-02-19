import { NotFound } from '@duvdu-v1/duvdu';

import { GetCategoryHandler } from '../types/endpoints/endpoints';
import { Category } from '../models/category.model';


export const getCategoryHandler:GetCategoryHandler = async (req,res,next)=>{
  const category = await Category.findById(req.params.categoryId);

  if (!category) return next(new NotFound('category not found'));
  res.status(200).json({message:'success' , data : category});
};