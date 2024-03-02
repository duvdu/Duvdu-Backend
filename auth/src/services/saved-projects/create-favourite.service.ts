import { SavedProjects } from '../../models/Saved-Project.model';

export const createDefaultSavedProject = async (userId?: string) => {
  if (!userId) return;
  await SavedProjects.create({ user: userId, title: 'favourite', projects: [] });
};
