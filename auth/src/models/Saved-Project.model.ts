import { model, Schema } from 'mongoose';

import { IsavedProject } from '../types/SavedProjects';

const savedProjectsSchema = new Schema<IsavedProject>({
  user: { type: Schema.Types.ObjectId, ref: 'users' },
  title: String,
  projects: [{ type: Schema.Types.ObjectId, ref: 'projects' }],
});

savedProjectsSchema.index({ user: 1, title: 1 }, { unique: true });

export const SavedProjects = model<IsavedProject>('saved-projects', savedProjectsSchema);
