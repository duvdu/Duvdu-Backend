import 'express-async-errors';
import {
  BadRequestError,
  Categories,
  NotAllowedError,
  NotFound,
  SuccessResponse,
  TeamProject,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const addCategoryHandler: RequestHandler<
  { teamId: string },
  SuccessResponse,
  { category: string },
  unknown
> = async (req, res, next) => {
  const project = await TeamProject.findOne({ _id: req.params.teamId, isDeleted: { $ne: true } });
  if (!project)
    return next(new NotFound({ en: 'team not found', ar: 'التيم غير موجود' }, req.lang));

  if (project.user.toString() != req.loggedUser.id)
    return next(new NotAllowedError(undefined, req.lang));

  const category = await Categories.findById(req.body.category);
  if (!category)
    return next(
      new NotFound({ en: 'category not found', ar: 'لم يتم العثور على الفئة' }, req.lang),
    );

  if (hasDuplicates([req.body.category, ...project.creatives.map((el) => el.category.toString())]))
    return next(new BadRequestError({ en: 'duplicated category', ar: 'فئة مكررة' }, req.lang));

  await TeamProject.findByIdAndUpdate(
    req.params.teamId,
    {
      $push: {
        creatives: { category: req.body.category },
      },
    },
    { new: true },
  );

  res.status(200).json({ message: 'success' });
};

export const hasDuplicates = (arrayOfIds: string[]) => {
  const uniqueIds = new Set(arrayOfIds);
  return uniqueIds.size !== arrayOfIds.length;
};
