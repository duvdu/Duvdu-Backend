import {
  SuccessResponse,
  Categories,
  NotFound,
  BadRequestError,
  Users,
  PortfolioPosts,
  Bucket,
  Files,
  IportfolioPost,
  FOLDERS,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { createInvitedUsers } from '../../services/create-invited-users';

export const createProjectHandler: RequestHandler<
  unknown,
  SuccessResponse<{ data: IportfolioPost }>,
  Pick<
    IportfolioPost,
    'title' | 'desc' | 'address' | 'category' | 'projectBudget' | 'projectScale' | 'showOnHome'
  > &
    Partial<Pick<IportfolioPost, 'creatives' | 'tools' | 'tags' | 'searchKeywords'>> & {
      invitedCreatives?: [{ phoneNumber: { number: string }; fees: number }];
    }
> = async (req, res, next) => {
  const attachments = <Express.Multer.File[]>(req.files as any).attachments;
  const cover = <Express.Multer.File[]>(req.files as any).cover;

  const category = await Categories.findOne({ _id: req.body.category });
  if (!category) return next(new NotFound('category not found'));
  if (category.cycle !== 1)
    return next(new BadRequestError('this category not related to this cycle'));

  const creativesCount = await Users.countDocuments({
    _id: req.body.creatives?.map((el) => el.creative),
  });
  if (req.body.creatives && creativesCount !== req.body.creatives.length)
    return next(new BadRequestError('invalid creatives'));
  let invitedCreatives;
  if (req.body.invitedCreatives)
    invitedCreatives = await createInvitedUsers(req.body.invitedCreatives);

  const project = await PortfolioPosts.create({
    ...req.body,
    creatives: [...(req.body.creatives || []), ...(invitedCreatives || [])],
    user: req.loggedUser.id,
  });
  await new Bucket().saveBucketFiles(FOLDERS.portfolio_post, ...attachments, ...cover);
  project.cover = `${FOLDERS.portfolio_post}/${cover[0].filename}`;
  project.attachments = attachments.map((el) => `${FOLDERS.portfolio_post}/${el.filename}`);
  await project.save();
  Files.removeFiles(...project.attachments, project.cover);

  res.status(201).json({ message: 'success', data: project });
};
