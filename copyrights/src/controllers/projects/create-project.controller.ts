import { SuccessResponse, Categories, NotFound, BadRequestError } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { CopyRights, IcopyRights } from '../../models/copyrights.model';

export const createProjectHandler: RequestHandler<
  unknown,
  SuccessResponse<{ data: IcopyRights }>,
  Pick<IcopyRights, 'category' | 'price' | 'duration' | 'address' | 'showOnHome'> &
    Partial<Pick<IcopyRights, 'searchKeywords'>>
> = async (req, res, next) => {
  const category = await Categories.findOne({ _id: req.body.category });
  if (!category) return next(new NotFound('category not found'));
  if (category.cycle !== 3)
    return next(new BadRequestError('this category not related to this cycle'));

  const project = await CopyRights.create({
    ...req.body,
    user: req.loggedUser.id,
  });
  res.status(201).json({ message: 'success', data: project });
};
