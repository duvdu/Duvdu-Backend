import 'express-async-errors';

import { MODELS, NotAllowedError, Project, ProjectCycle } from '@duvdu-v1/duvdu';

import { DeleteProjectHandler } from '../../../types/project.endoints';

export const deleteProjectCrmHandler: DeleteProjectHandler = async (req, res, next) => {
  const project = await ProjectCycle.findOneAndUpdate(
    { _id: req.params.projectId },
    { isDeleted: true },
    { new: true },
  );

  if (!project) return next(new NotAllowedError(undefined, req.lang));

  await Project.findOneAndDelete({
    project: { type: project.id, ref: MODELS.portfolioPost },
    user: project.user,
    ref: MODELS.portfolioPost,
  });

  res.status(204).json({ message: 'success' });
};
