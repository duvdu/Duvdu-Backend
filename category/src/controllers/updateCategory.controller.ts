import { BadRequestError } from '@duvdu-v1/duvdu';

import { Category } from '../models/category.model';
import { UpdateCategoryHandler } from '../types/endpoints';
import { saveFiles , removeFiles } from '../utils/file';


export const updateCategoryHandler:UpdateCategoryHandler = async (req,res,next)=>{
  const files = <{image?:[Express.Multer.File]}>(req.files);
  const image = files.image ? files.image[0] : undefined;

  const category = await Category.findByIdAndUpdate(
    req.params.categoryId,
    {
      ...req.body,
      [image ? 'image' : (null as any)]: `/media/images/${image?.filename}`,
    }
  );

  if (!category) return next(new BadRequestError('can not update category'));

  saveFiles('images' , image);
  removeFiles(image ? category.image : undefined);

  res.status(200).json({message:'success'});
};