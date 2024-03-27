import { Bookmarks } from '@duvdu-v1/duvdu';

export const createDefaultBookmark = async (userId?: string) => {
  if (!userId) return;
  await Bookmarks.create({ user: userId, title: 'favourite', projects: [] });
};
