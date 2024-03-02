import { NotFound } from '@duvdu-v1/duvdu';

import { SavedProjects } from '../../models/Saved-Project.model';
import { UpdateSavedProjectHandler } from '../../types/endpoints/saved-projects.endpoints';

export const updateSavedProjectHandler: UpdateSavedProjectHandler = async (req, res, next) => {
  const savedProject = await SavedProjects.findByIdAndUpdate(req.params.savedProjectId, {
    title: req.body.title,
  });

  if (!savedProject) return next(new NotFound());
  res.status(200).json({ message: 'success' });
};
