import { model, Schema } from 'mongoose';

import { Ibookmark } from '../types/Bookmarks';
import { MODELS } from '../types/model-names';

const bookmarksSchema = new Schema<Ibookmark>(
  {
    user: { type: Schema.Types.ObjectId, ref: MODELS.user },
    title: String,
    image: String,
  },
  { collection: MODELS.bookmark, timestamps: true },
);

bookmarksSchema.index({ user: 1, title: 1 }, { unique: true });
bookmarksSchema.index({ user: 1 });

export const Bookmarks = model<Ibookmark>(MODELS.bookmark, bookmarksSchema);
