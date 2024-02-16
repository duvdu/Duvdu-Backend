import { NotFound } from '@duvdu-v1/duvdu';

import { Category } from '../models/category.model';
import { RemoveCategoryHandler } from '../types/endpoints';
import { removeFiles } from '../utils/file';

export const removeCategoryHandler:RemoveCategoryHandler = async (req,res,next)=>{
  const category = await Category.findByIdAndDelete(req.params.categoryId);
  if (!category) return next(new NotFound('category not found'));
  
  removeFiles(category.image);
  res.status(204).json({message:'success'});
};