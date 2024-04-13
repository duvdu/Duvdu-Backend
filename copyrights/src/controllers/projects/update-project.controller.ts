import {
  SuccessResponse,
  NotFound,
  NotAllowedError,
  CopyRights,
  IcopyRights,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const updateProjectHandler: RequestHandler<
  { projectId: string },
  SuccessResponse<{ data: IcopyRights }>,
  Partial<
    Pick<
      IcopyRights,
      'price' | 'duration' | 'address' | 'showOnHome' | 'searchKeywords' | 'isDeleted'
    >
  >
> = async (req, res, next) => {
  const project = await CopyRights.findOne({ _id: req.params.projectId, isDeleted: { $ne: true } });
  if (!project) return next(new NotFound('project not found'));

  if (project.user.toString() !== req.loggedUser.id)
    return next(new NotAllowedError('you are not the owner of this project'));

  const newProject = <IcopyRights>await CopyRights.findByIdAndUpdate(
    req.params.projectId,
    req.body,
    {
      new: true,
    },
  );

  res.status(200).json({ message: 'success', data: newProject });
};
