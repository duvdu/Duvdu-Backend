import { SuccessResponse, Bookmarks, BookmarkProjects, Bucket, NotFound } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';

export const createBookmark: RequestHandler<
  unknown,
  SuccessResponse<{ data: any }>,
  { title: string; image?: string }
> = async (req, res) => {
  const bucket = new Bucket();
  if (req.file) {
    await bucket.saveBucketFiles('bookmark', req.file);
    req.body.image = `bookmark/${req.file.filename}`;
  }

  try {
    const bookmark = await Bookmarks.create({
      user: req.loggedUser.id,
      title: req.body.title,
      image: req.body.image,
    });
    res.status(201).json({ message: 'success', data: bookmark });
  } catch (error) {
    if (req.file) bucket.removeBucketFiles(`bookmark/${req.file.filename}`);
    throw error;
  }
};

export const updateBookmark: RequestHandler<
  { bookmarkId: string },
  SuccessResponse<{ data: any }>,
  { title?: string; image?: string }
> = async (req, res, next) => {
  const bucket = new Bucket();
  if (req.file) {
    await bucket.saveBucketFiles('bookmark', req.file);
    req.body.image = `bookmark/${req.file.filename}`;
  }
  const bookmark = await Bookmarks.findOneAndUpdate(
    { _id: req.params.bookmarkId, user: req.loggedUser.id },
    req.body,
  );
  if (!bookmark) {
    if (req.file) bucket.removeBucketFiles(`bookmark/${req.file.filename}`);
    return next(new NotFound(undefined, req.lang));
  } else if (bookmark.image) {
    bucket.removeBucketFiles(bookmark.image);
  }

  res.status(200).json({ message: 'success', data: 'data updated' });
};

export const removeBookmark: RequestHandler<
  { bookmarkId: string },
  SuccessResponse<{ data: any }>
> = async (req, res, next) => {
  const bucket = new Bucket();
  const bookmark = await Bookmarks.findOneAndDelete({
    _id: req.params.bookmarkId,
    user: req.loggedUser.id,
  });
  if (!bookmark) return next(new NotFound(undefined, req.lang));
  BookmarkProjects.deleteMany({ bookmark: bookmark._id });
  if (bookmark.image) bucket.removeBucketFiles(bookmark.image);

  res.json({ message: 'success', data: 'data deleted' });
};

export const findBookmarks: RequestHandler<unknown, SuccessResponse<{ data: any }>> = async (
  req,
  res,
) => {
  const bookmarks = await Bookmarks.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.loggedUser.id as string),
      },
    },
    {
      $lookup: {
        from: 'bookmark_projects',
        localField: '_id',
        foreignField: 'bookmark',
        as: 'bookmarkProjects',
      },
    },
    {
      $addFields: {
        bookmarkProjects: { $slice: ['$bookmarkProjects', 3] },
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        image: { $concat: [process.env.BUCKET_HOST, '/', '$image'] },
        bookmarkProjects: 1,
      },
    },
  ]);
  res.json({ message: 'success', data: bookmarks });
};
