import { BadRequestError, Users, SuccessResponse, NotFound } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { NotAllowedError } from '../../../errors/not-allowed-error';
import { Iproject, Projects } from '../../models/project';
import { createInvitedUsers } from '../../services/create-invited-users';
import { FOLDERS } from '../../types/folders';
import { removeBucketFiles, saveBucketFiles } from '../../utils/bucket';

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
  const attachments = <Express.Multer.File[] | undefined>(req.files as any)?.attachments;
  const cover = <Express.Multer.File[] | undefined>(req.files as any)?.cover;

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
  if (attachments) {
    await saveBucketFiles(FOLDERS.portfolio_post, ...attachments);
    (req.body as any).attachments = attachments.map(
      (el) => `${FOLDERS.portfolio_post}/${el.filename}`,
    );
    await removeBucketFiles(...project.attachments);
  }
  if (cover) {
    await saveBucketFiles(FOLDERS.portfolio_post, ...cover);
    (req.body as any).cover = `${FOLDERS.portfolio_post}/${cover[0].filename}`;
    await removeBucketFiles(project.cover);
  }
  const newProject = <Iproject>await Projects.findByIdAndUpdate(req.params.projectId, req.body, {
    new: true,
  });

  res.status(200).json({ message: 'success', data: newProject });
};
