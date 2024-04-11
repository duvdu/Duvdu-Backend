import { SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { NotAllowedError } from '../../../errors/not-allowed-error';
import { Projects } from '../../models/project';

export const removeProjectHandler: RequestHandler<{ projectId: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const project = await Projects.findOneAndUpdate(
    {
      _id: req.params.projectId,
      user: req.loggedUser.id,
    },
    { isDeleted: true },
  );
  if (!project) return next(new NotAllowedError());

  res.status(200).json({ message: 'success' });
};
