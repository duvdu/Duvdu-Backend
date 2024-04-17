import { BadRequestError , Bucket, Categories, Files, FOLDERS } from '@duvdu-v1/duvdu';

import { CreateCategoryHandler } from '../types/endpoints/endpoints';

export const createCategoryHandler: CreateCategoryHandler = async (req, res, next) => {
  const cover = <Express.Multer.File[]>(req.files as any).cover;

  const category = await Categories.create(req.body);

  if (!category) return next(new BadRequestError('can not create category'));
  await new Bucket().saveBucketFiles(FOLDERS.category , ...cover);
  category.image = `${FOLDERS.category}/${cover[0].filename}`;
  await category.save();
  Files.removeFiles(category.image);
  res.status(201).json({ message: 'success' , data:category });
};
