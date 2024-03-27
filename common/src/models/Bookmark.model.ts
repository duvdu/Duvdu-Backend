import { model, Schema } from 'mongoose';

import { Ibookmark } from '../types/Bookmarks';
import { MODELS } from '../types/model-names';

const bookmarksSchema = new Schema<Ibookmark>(
  {
    user: { type: Schema.Types.ObjectId, ref: MODELS.user },
    title: String,
    projects: [{ type: Schema.Types.ObjectId, ref: MODELS.project }],
  },
  { collection: MODELS.bookmark },
);

bookmarksSchema.index({ user: 1, title: 1 }, { unique: true });

export const Bookmarks = model<Ibookmark>(MODELS.bookmark, bookmarksSchema);
