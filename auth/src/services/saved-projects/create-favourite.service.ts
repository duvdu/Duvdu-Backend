import { Bookmarks } from '../../models/Bookmark.model';

export const createDefaultBookmark = async (userId?: string) => {
  if (!userId) return;
  await Bookmarks.create({ user: userId, title: 'favourite', projects: [] });
};
