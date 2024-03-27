import { NotFound , Categories } from '@duvdu-v1/duvdu';

import { RemoveCategoryHandler } from '../types/endpoints/endpoints';
import { removeFiles } from '../utils/file';

export const removeCategoryHandler: RemoveCategoryHandler = async (req, res, next) => {
  const category = await Categories.findByIdAndDelete(req.params.categoryId);
  if (!category) return next(new NotFound('category not found'));

  removeFiles(category.image);
  res.status(204).json({ message: 'success' });
};
