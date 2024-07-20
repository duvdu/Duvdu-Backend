import { model, Schema, Types } from 'mongoose';

import { MODELS } from '../types/model-names';




enum RefModels {
    copyright = MODELS.portfolioPost,
    studio = 'rentals'
  }

  interface IProjectView {
    user: Types.ObjectId;
    project: Types.ObjectId;
    ref: string;
    count: number;
    date: Date;
  }
  
const projectViewSchema = new Schema<IProjectView>({
  user: { type: Schema.Types.ObjectId, ref: MODELS.user },
  project: { type: Schema.Types.ObjectId, refPath: 'ref' },
  ref: { type: String, enum: RefModels },
  count: { type: Number, default: 1 },
  date: { type: Date, default: Date.now }
}, { timestamps: true, collection: MODELS.projectsViews });
  
projectViewSchema.index({ project: 1, ref: 1, date: 1 }, { unique: true });
  
export const ProjectView = model<IProjectView>(MODELS.projectsViews, projectViewSchema);