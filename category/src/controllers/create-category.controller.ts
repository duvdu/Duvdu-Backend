import { BadRequestError, Bucket, Categories, CYCLES, FOLDERS } from '@duvdu-v1/duvdu';

import { CreateCategoryHandler } from '../types/endpoints/endpoints';

export const createCategoryHandler: CreateCategoryHandler = async (req, res, next) => {
  const cover = <Express.Multer.File[]>(req.files as any).cover;

  if(req.body.isRelated && req.body.relatedCategory)
    return next(new BadRequestError({en:'can not add related category to related category' , ar:'لا يمكن إضافة فئة مرتبطة إلى فئة مرتبطة'} , req.lang));
  
  if(req.body.relatedCategory && req.body.cycle != CYCLES.portfolioPost)
    return next(new BadRequestError({en:'related category is not allowed in this cycle' , ar:'الفئة المرتبطة غير مسموح بها في هذه الدورة'} , req.lang));

  if(req.body.relatedCategory){
    const categoryCount = await Categories.countDocuments({_id:{$in:req.body.relatedCategory} , isRelated:true});
    if(categoryCount != req.body.relatedCategory.length)
      return next(new BadRequestError({en:'related category not found' , ar:'الفئة المرتبطة غير موجودة'} , req.lang));
    req.body.relatedCategory = [...new Set(req.body.relatedCategory)];
  }


  const category = await Categories.create(req.body);

  await new Bucket().saveBucketFiles(FOLDERS.category, ...cover);
  category.image = `${FOLDERS.category}/${cover[0].filename}`;
  await category.save();
  res.status(201).json({ message: 'success', data: category });
};
