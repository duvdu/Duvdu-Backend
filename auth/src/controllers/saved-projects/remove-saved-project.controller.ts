import { NotFound } from '@duvdu-v1/duvdu';

import { SavedProjects } from '../../models/Saved-Project.model';
import { RemoveSavedProjectHandler } from '../../types/endpoints/saved-projects.endpoints';

export const removeSavedProjectHandler: RemoveSavedProjectHandler = async (req, res, next) => {
  const savedProject = await SavedProjects.findByIdAndDelete(req.params.savedProjectId);
  if (!savedProject) return next(new NotFound());

  res.status(204).json();
};
