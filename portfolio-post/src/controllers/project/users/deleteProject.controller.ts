import 'express-async-errors';

import { MODELS, NotAllowedError, Project, ProjectCycle } from '@duvdu-v1/duvdu';

import { DeleteProjectHandler } from '../../../types/project.endoints';

export const deleteProjectHandler: DeleteProjectHandler = async (req, res, next) => {
  const project = await ProjectCycle.findOneAndUpdate(
    { _id: req.params.projectId, user: req.loggedUser.id },
    { isDeleted: true },
    { new: true },
  );

  if (!project) return next(new NotAllowedError(undefined, req.lang));

  await Project.findOneAndDelete({
    project: { type: project.id, ref: MODELS.portfolioPost },
    user: req.loggedUser.id,
    ref: MODELS.portfolioPost,
  });

  res.status(204).json({ message: 'success' });
};
