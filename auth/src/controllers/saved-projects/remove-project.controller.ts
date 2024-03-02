import { NotFound } from '@duvdu-v1/duvdu';

import { SavedProjects } from '../../models/Saved-Project.model';
import { RemoveProjectFromSavedProjectHandler } from '../../types/endpoints/saved-projects.endpoints';

export const removeProjectFromSavedProjectHandler: RemoveProjectFromSavedProjectHandler = async (
  req,
  res,
  next,
) => {
  const savedProject = await SavedProjects.findByIdAndUpdate(req.params.savedProjectId, {
    $pull: { projects: req.params.projectId },
  });
  if (!savedProject) return next(new NotFound());
  res.status(200).json({ message: 'success' });
};
