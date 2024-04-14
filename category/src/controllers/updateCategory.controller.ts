import { NotFound, Categories } from '@duvdu-v1/duvdu';

import { UpdateCategoryHandler } from '../types/endpoints/endpoints';
import { saveFiles, removeFiles } from '../utils/file';

export const updateCategoryHandler: UpdateCategoryHandler = async (req, res, next) => {
  const files = <{ image?: [Express.Multer.File] }>req.files;
  const image = files.image ? files.image[0] : undefined;

  const category = await Categories.findByIdAndUpdate(req.params.categoryId, {
    ...req.body,
    [image ? 'image' : (null as any)]: `/media/images/${image?.filename}`,
  });

  if (!category) return next(new NotFound('can not update category'));

  saveFiles('images', image);
  removeFiles(image ? category.image : undefined);
  const updatedCategory = await category.save();
  res.status(200).json({ message: 'success' , data:updatedCategory });
};
