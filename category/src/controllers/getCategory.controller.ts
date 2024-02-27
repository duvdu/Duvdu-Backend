import { NotFound } from '@duvdu-v1/duvdu';

import { Category } from '../models/category.model';
import { GetCategoryHandler } from '../types/endpoints/endpoints';

export const getCategoryHandler: GetCategoryHandler = async (req, res, next) => {
  const category = await Category.findOne({ id: req.params.categoryId, status: 1 });
  if (!category) return next(new NotFound('category not found'));
  res.status(200).json({ message: 'success', data: category });
};
