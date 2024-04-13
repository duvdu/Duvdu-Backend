import { SuccessResponse, NotAllowedError } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { CopyRights } from '../../models/copyrights.model';

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
  if (!project) return next(new NotAllowedError());

  res.status(200).json({ message: 'success' });
};
