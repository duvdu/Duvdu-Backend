import { model, Schema, Types } from 'mongoose';

import { MODELS } from '../types/model-names';

export interface IbookmarkProject {
  project: Types.ObjectId;
  user: Types.ObjectId;
  bookmark: Types.ObjectId;
}

export const BookmarkProjects = model<IbookmarkProject>(
  'bookmark_projects',
  new Schema<IbookmarkProject>({
    project: { type: Schema.Types.ObjectId, ref: MODELS.projects },
    user: { type: Schema.Types.ObjectId, ref: MODELS.user },
    bookmark: { type: Schema.Types.ObjectId, ref: MODELS.bookmark },
  })
    .index({ project: 1, bookmark: 1, user: 1 }, { unique: true })
    .index({ user: 1, bookmark: 1 }),
);
