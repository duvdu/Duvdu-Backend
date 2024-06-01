import { NotFound, Categories, Bucket, FOLDERS, Files } from '@duvdu-v1/duvdu';

import { UpdateCategoryHandler } from '../types/endpoints/endpoints';

export const updateCategoryHandler: UpdateCategoryHandler = async (req, res, next) => {
  const cover = <Express.Multer.File[] | undefined>(req.files as any).cover;
  const category = await Categories.findById(req.params.categoryId);
  if (!category) 
    return next(new NotFound({en:'category not found' , ar:'الفئة غير موجودة'} , req.lang));
  const s3 = new Bucket();
  if (cover) {
    await s3.saveBucketFiles(FOLDERS.category , ...cover);
    req.body.image = `${FOLDERS.category}/${cover[0].filename}`;
    await s3.removeBucketFiles(category.image);
    Files.removeFiles(req.body.image);
    delete req.body.cover;
  }

  const newCategory = await Categories.findByIdAndUpdate(req.params.categoryId, req.body , {new:true});

  res.status(200).json({ message: 'success' , data:newCategory! });
};

