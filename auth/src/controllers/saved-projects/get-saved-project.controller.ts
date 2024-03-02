import { NotFound } from '@duvdu-v1/duvdu';

import { SavedProjects } from '../../models/Saved-Project.model';
import { GetSavedProjectHandler } from '../../types/endpoints/saved-projects.endpoints';

export const getSavedProjectHandler: GetSavedProjectHandler = async (req, res, next) => {
  const savedProject = await SavedProjects.findById(req.params.savedProjectId)
    .select('title projects')
    .populate('projects');

  if (!savedProject) return next(new NotFound());

  res.status(200).json({ message: 'success', data: savedProject });
};
