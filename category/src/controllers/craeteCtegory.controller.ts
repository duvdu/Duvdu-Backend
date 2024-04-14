import { BadRequestError , Categories } from '@duvdu-v1/duvdu';

import { CreateCategoryHandler } from '../types/endpoints/endpoints';
import { saveFiles } from '../utils/file';

export const createCategoryHandler: CreateCategoryHandler = async (req, res, next) => {
  const files = <{ image?: [Express.Multer.File] }>req.files;
  const image = files.image ? files.image[0] : undefined;

  const category = await Categories.create({
    ...req.body,
    [image ? 'image' : (null as any)]: `/media/images/${image?.filename}`,
  });

  if (!category) return next(new BadRequestError('can not create category'));
  saveFiles('images', image);
  res.status(201).json({ message: 'success' , data:category });
};
