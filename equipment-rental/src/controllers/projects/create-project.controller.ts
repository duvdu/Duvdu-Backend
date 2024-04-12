import {
  SuccessResponse,
  Categories,
  NotFound,
  BadRequestError,
  Bucket,
  Files,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { EquipmentRentals, IequipmentRental } from '../../models/equipment-rental.model';

export const createProjectHandler: RequestHandler<
  unknown,
  SuccessResponse<{ data: IequipmentRental }>,
  Pick<
    IequipmentRental,
    | 'title'
    | 'desc'
    | 'address'
    | 'tools'
    | 'canChangeAddress'
    | 'pricePerHour'
    | 'insurance'
    | 'showOnHome'
    | 'category'
  > &
    Partial<Pick<IequipmentRental, 'tags' | 'searchKeywords'>>
> = async (req, res, next) => {
  const attachments = <Express.Multer.File[]>(req.files as any).attachments;
  const cover = <Express.Multer.File[]>(req.files as any).cover;

  const category = await Categories.findOne({ _id: req.body.category });
  if (!category) return next(new NotFound('category not found'));
  if (category.cycle !== 2)
    return next(new BadRequestError('this category not related to this cycle'));

  const project = await EquipmentRentals.create({
    ...req.body,
    user: req.loggedUser.id,
  });
  await new Bucket().saveBucketFiles('equipment-rental', ...attachments, ...cover);
  project.cover = `${'equipment-rental'}/${cover[0].filename}`;
  project.attachments = attachments.map((el) => `${'equipment-rental'}/${el.filename}`);
  await project.save();
  Files.removeFiles(...project.attachments, project.cover);

  res.status(201).json({ message: 'success', data: project });
};
