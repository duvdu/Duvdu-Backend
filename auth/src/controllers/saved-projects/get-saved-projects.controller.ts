import { NotFound } from '@duvdu-v1/duvdu';

import { SavedProjects } from '../../models/Saved-Project.model';
import { GetSavedProjectsHandler } from '../../types/endpoints/saved-projects.endpoints';

export const getSavedProjectsHandler: GetSavedProjectsHandler = async (req, res, next) => {
  const savedProjects = await SavedProjects.find({ user: req.loggedUser.id })
    .select('user title')
    .populate({ path: 'projects', options: { limit: 3, sort: { createdAt: -1 } } });

  if (!savedProjects) return next(new NotFound());

  res.status(200).json({ message: 'success', data: savedProjects });
};
