import { SuccessResponse, NotAllowedError, PortfolioPosts } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const removeProjectHandler: RequestHandler<{ projectId: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const project = await PortfolioPosts.findOneAndUpdate(
    {
      _id: req.params.projectId,
      user: req.loggedUser.id,
    },
    { isDeleted: true },
  );
  if (!project) return next(new NotAllowedError(undefined , req.lang));

  res.status(200).json({ message: 'success' });
};
