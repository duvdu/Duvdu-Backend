import { model, Schema } from 'mongoose';

import { MODELS } from '../types/model-names';
import { IsavedProject } from '../types/SavedProjects';

const savedProjectsSchema = new Schema<IsavedProject>(
  {
    user: { type: Schema.Types.ObjectId, ref: MODELS.user },
    title: String,
    projects: [{ type: Schema.Types.ObjectId, ref: MODELS.project }],
  },
  { collection: MODELS.savedProject },
);

savedProjectsSchema.index({ user: 1, title: 1 }, { unique: true });

export const SavedProjects = model<IsavedProject>(MODELS.savedProject, savedProjectsSchema);
