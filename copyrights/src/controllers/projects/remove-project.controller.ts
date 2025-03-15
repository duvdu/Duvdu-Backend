import {
  SuccessResponse,
  NotAllowedError,
  CopyRights,
  Project,
  MODELS,
  PERMISSIONS,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const removeProjectHandler: RequestHandler<{ projectId: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const project = await CopyRights.findOneAndUpdate(
    {
      _id: req.params.projectId,
      user: req.loggedUser.id,
      isDeleted: { $ne: true },
    },
    { isDeleted: true },
  );
  if (!project) return next(new NotAllowedError(undefined, req.lang));

  if (
    project.user.toString() !== req.loggedUser.id ||
    req.loggedUser.role.permissions.includes(PERMISSIONS.removeCopyrightHandler)
  )
    return next(new NotAllowedError(undefined, req.lang));

  await Project.findOneAndDelete({
    project: {
      type: project.id,
      ref: MODELS.copyrights,
    },
    user: req.loggedUser.id,
    ref: MODELS.copyrights,
  });

  res.status(200).json({ message: 'success' });
};
