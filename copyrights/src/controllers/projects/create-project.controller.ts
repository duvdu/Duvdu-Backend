import {
  SuccessResponse,
  Categories,
  NotFound,
  BadRequestError,
  CopyRights,
  IcopyRights,
  Project,
  MODELS,
  CYCLES,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const createProjectHandler: RequestHandler<
  unknown,
  SuccessResponse<{ data: IcopyRights }>,
  Pick<IcopyRights, 'category' | 'price' | 'duration' | 'address' | 'showOnHome'> &
    Partial<Pick<IcopyRights, 'searchKeywords'>>
> = async (req, res, next) => {
  const category = await Categories.findOne({ _id: req.body.category });
  if (!category) return next(new NotFound('category not found'));
  if (category.cycle !== CYCLES.copyRights)
    return next(new BadRequestError('this category not related to this cycle'));

  const project = await CopyRights.create({
    ...req.body,
    user: req.loggedUser.id,
  });

  await Project.create({
    project: {
      type: project.id,
      ref: MODELS.copyrights,
    },
    ref: MODELS.copyrights,
  });
  res.status(201).json({ message: 'success', data: project });
};
