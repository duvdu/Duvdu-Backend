import { BadRequestError, Categories, NotFound, SuccessResponse, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { NotAllowedError } from './../../../errors/not-allowed-error';
import { Iproject, Projects } from '../../models/project';
import { createInvitedUsers } from '../../services/create-invited-users';
import { FOLDERS } from '../../types/folders';
import { saveBucketFiles } from '../../utils/bucket';
import { removeFiles } from '../../utils/file';

export const createProjectHandler: RequestHandler<
  unknown,
  SuccessResponse<{ data: Iproject }>,
  Pick<
    Iproject,
    | 'title'
    | 'desc'
    | 'address'
    | 'category'
    | 'creatives'
    | 'projectBudget'
    | 'projectScale'
    | 'searchKeywords'
    | 'showOnHome'
    | 'tools'
    | 'tags'
  > & { invitedCreatives: [{ phoneNumber: { number: string }; fees: number }] }
> = async (req, res, next) => {
  const attachments = <Express.Multer.File[]>(req.files as any).attachments;
  const cover = <Express.Multer.File>(req.files as any).cover;

  const category = await Categories.findOne({ _id: req.body.category });
  if (!category) return next(new NotFound('category not found'));
  if (category.cycle !== 1)
    return next(new BadRequestError('this category not related to this cycle'));

  const creativesCount = await Users.countDocuments({
    _id: req.body.creatives.map((el) => el.creative),
  });
  if (creativesCount !== req.body.creatives.length)
    return next(new BadRequestError('invalid cretives'));
  const invitedCreatives = await createInvitedUsers(req.body.invitedCreatives);

  const project = await Projects.create({
    ...req.body,
    creatives: [...req.body.creatives, ...invitedCreatives],
    cover: `${FOLDERS.portfolio_post}/${cover.filename}`,
    attachments: attachments.map((el) => `${FOLDERS.portfolio_post}/${el.filename}`),
    user: req.loggedUser.id,
  });

  await saveBucketFiles(FOLDERS.portfolio_post, ...attachments, cover);
  removeFiles(FOLDERS.portfolio_post, ...project.attachments, project.cover);

  res.status(201).json({ message: 'success', data: project });
};

export const updateProjectHandler: RequestHandler<
  { projectId: string },
  SuccessResponse<{ data: Iproject }>,
  Partial<
    Pick<
      Iproject,
      | 'title'
      | 'desc'
      | 'address'
      | 'creatives'
      | 'projectBudget'
      | 'projectScale'
      | 'searchKeywords'
      | 'showOnHome'
      | 'tools'
      | 'tags'
    > & { invitedCreatives: [{ phoneNumber: { number: string }; fees: number }] }
  >
> = async (req, res, next) => {
  const project = await Projects.findById(req.params.projectId);
  if (!project) return next(new NotFound('project not found'));

  if (project.user.toString() !== req.loggedUser.id)
    return next(new NotAllowedError('you are not the owner of this project'));

  if (req.body.creatives) {
    const creativesCount = await Users.countDocuments({
      _id: req.body.creatives.map((el) => el.creative),
    });
    if (creativesCount !== req.body.creatives.length)
      return next(new BadRequestError('invalid cretives'));
  }
  if (req.body.invitedCreatives) {
    const invitedCreatives = await createInvitedUsers(req.body.invitedCreatives);
    req.body.creatives
      ? req.body.creatives.push(invitedCreatives as any)
      : (req.body.creatives = invitedCreatives as any);
  }

  const newProject = <Iproject>await Projects.findByIdAndUpdate(req.params.projectId, req.body, {
    new: true,
  });

  res.status(200).json({ message: 'success', data: newProject });
};

export const removeProjectHandler: RequestHandler<{ projectId: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const result = await Projects.deleteOne({ _id: req.params.projectId, user: req.loggedUser.id });
  if (result.deletedCount < 1) return next(new NotAllowedError());

  res.status(204).end();
};
