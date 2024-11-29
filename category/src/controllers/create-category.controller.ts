import { Bucket, Categories, FOLDERS } from '@duvdu-v1/duvdu';

import { CreateCategoryHandler } from '../types/endpoints/endpoints';

export const createCategoryHandler: CreateCategoryHandler = async (req, res) => {
  const cover = <Express.Multer.File[]>(req.files as any).cover;

  const category = await Categories.create(req.body);

  await new Bucket().saveBucketFiles(FOLDERS.category, ...cover);
  category.image = `${FOLDERS.category}/${cover[0].filename}`;
  await category.save();
  res.status(201).json({ message: 'success', data: category });
};
