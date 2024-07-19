import { NotAllowedError, Project, Rentals } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const removeProjectHandler: RequestHandler = async (req, res, next) => {
  const project = await Rentals.findOneAndUpdate(
    {
      _id: req.params.projectId,
      user: req.loggedUser.id,
    },
    {
      isDeleted: true,
    },
    {new:true}
  );

  if (!project) return next(new NotAllowedError(undefined, req.lang));

  await Project.findOneAndDelete({
    project: { type: project.id, ref: 'rentals' },
    user: req.loggedUser.id,
    ref: 'rentals',
  });

  res.status(204).json({ message: 'success' });
};
