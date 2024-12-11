import 'express-async-errors';
import { NotFound, Categories, Bucket, FOLDERS, BadRequestError, CYCLES } from '@duvdu-v1/duvdu';

import { UpdateCategoryHandler } from '../types/endpoints/endpoints';

export const updateCategoryHandler: UpdateCategoryHandler = async (req, res, next) => {
  const cover = <Express.Multer.File[] | undefined>(req.files as any).cover;
  const category = await Categories.findById(req.params.categoryId);
  if (!category)
    return next(new NotFound({ en: 'category not found', ar: 'الفئة غير موجودة' }, req.lang));

  if (category.isRelated && req.body.relatedCategory)
    return next(
      new BadRequestError(
        {
          en: 'can not add related category to related category',
          ar: 'لا يمكن إضافة فئة مرتبطة إلى فئة مرتبطة',
        },
        req.lang,
      ),
    );

  if (req.body.relatedCategory && category.cycle != CYCLES.portfolioPost)
    return next(
      new BadRequestError(
        {
          en: 'related category is not allowed in this cycle',
          ar: 'الفئة المرتبطة غير مسموح بها في هذه الدورة',
        },
        req.lang,
      ),
    );

  if (req.body.relatedCategory) {
    const categoryCount = await Categories.countDocuments({
      _id: { $in: req.body.relatedCategory },
      isRelated: true,
    });
    if (categoryCount != req.body.relatedCategory.length)
      return next(
        new BadRequestError(
          { en: 'related category not found', ar: 'الفئة المرتبطة غير موجودة' },
          req.lang,
        ),
      );
    req.body.relatedCategory = [...new Set(req.body.relatedCategory)];
  }

  const s3 = new Bucket();
  if (cover) {
    await s3.saveBucketFiles(FOLDERS.category, ...cover);
    req.body.image = `${FOLDERS.category}/${cover[0].filename}`;
    await s3.removeBucketFiles(category.image);
    delete req.body.cover;
  }

  const newCategory = await Categories.findByIdAndUpdate(req.params.categoryId, req.body, {
    new: true,
  });

  res.status(200).json({ message: 'success', data: newCategory! });
};
