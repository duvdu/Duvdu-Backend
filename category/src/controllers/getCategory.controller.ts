import { NotFound, Categories } from '@duvdu-v1/duvdu';

import { GetCategoryHandler } from '../types/endpoints/endpoints';

export const getCategoryHandler: GetCategoryHandler = async (req, res, next) => {
  const category = await Categories.findOne({ _id: req.params.categoryId, status: 1 });
  if (!category) return next(new NotFound('category not found'));
  res.status(200).json({ message: 'success', data: category });
};
