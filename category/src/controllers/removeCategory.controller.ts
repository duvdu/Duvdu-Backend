import { NotFound, Categories, Bucket } from '@duvdu-v1/duvdu';

import { RemoveCategoryHandler } from '../types/endpoints/endpoints';

export const removeCategoryHandler: RemoveCategoryHandler = async (req, res, next) => {
  const category = await Categories.findByIdAndDelete(req.params.categoryId);
  if (!category)
    return next(new NotFound({ en: 'category not found', ar: 'الفئة غير موجودة' }, req.lang));

  const s3 = new Bucket();
  await s3.removeBucketFiles(category.image);
  res.status(204).json({ message: 'success' });
};
