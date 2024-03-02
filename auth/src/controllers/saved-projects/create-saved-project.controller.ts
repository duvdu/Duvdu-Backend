import { NotFound } from '@duvdu-v1/duvdu';

import { Projects } from '../../models/Projects.model';
import { SavedProjects } from '../../models/Saved-Project.model';
import { CreateSavedProjectHandler } from '../../types/endpoints/saved-projects.endpoints';

export const createSavedProjectHandler: CreateSavedProjectHandler = async (req, res, next) => {
  const project = await Projects.findOne({ _id: req.body.projects[0] });
  console.log('project', project);
  if (!project) return next(new NotFound());

  await SavedProjects.create({
    user: req.loggedUser?.id,
    title: req.body.title,
    projects: req.body.projects,
  });
  res.status(200).json({ message: 'success' });
};
