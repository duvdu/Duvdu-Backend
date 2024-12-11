import { Categories, Icategory, NotFound, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const getCategoryAdminController: RequestHandler<
  { categoryId: string },
  SuccessResponse<{ data: Icategory }>
> = async (req, res) => {

  const category = await Categories.findById(req.params.categoryId);
  if (!category) 
    throw new NotFound({ en: 'category not found', ar: 'الفئة غير موجودة' }, req.lang);

  return res.status(200).json({
    message: 'success',
    data: category,
  });
};
