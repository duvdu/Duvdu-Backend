import { NotFound, Project, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose from 'mongoose';

export const getProjectByIdHandler: RequestHandler<
  { projectId: string },
  SuccessResponse<{ data: any }>
> = async (req, res, next) => {
  const allproject = await Project.findOne({ 'project.type': req.params.projectId });
  if (!allproject)
    return next(new NotFound({ en: 'project not found', ar: 'project not found' }, req.lang));
  const project = await mongoose.connection.db
    .collection(allproject.ref)
    .aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.projectId),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'user.category',
          foreignField: '_id',
          as: 'user.category',
        },
      },
      {
        $unwind: {
          path: '$user.category',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          user: {
            _id: 1,
            name: 1,
            'phoneNumber.number': 1,
            username: 1,
            profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$user.profileNumber'] },
            coverImage: { $concat: [process.env.BUCKET_HOST, '/', '$user.coverImage'] },
            profileViews: 1,
            isOnline: 1,
            isAvaliableToInstantProjects: 1,
            pricePerHour: 1,
            hasVerificationBadge: 1,
            rate: 1,
            isBlocked: 1,
            followCount: 1,
            likes: 1,
            address: 1,
            'category._id': 1,
            'category.title':
              req.lang === 'en' ? '$user.category.title.en' : '$user.category.title.ar',
            'category.cycle': 1,
          },
          category: {
            _id: 1,
            title: req.lang === 'en' ? '$user.category.title.en' : '$user.category.title.ar',
            cycle: 1,
          },
          tags: {
            $map: {
              input: '$tags',
              as: 'tag',
              in: {
                $cond: {
                  if: { $eq: [req.lang, 'en'] },
                  then: '$$tag.en',
                  else: '$$tag.ar',
                },
              },
            },
          },
          subCategory: req.lang === 'en' ? '$subCategory.en' : '$$subCategory.ar',
          price: 1,
          duration: 1,
          address: 1,
          searchKeywords: 1,
          showOnHome: 1,
          cycle: 1,
          rate: 1,
          location: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ])
    .toArray();

  if (!project)
    return next(new NotFound({ en: 'project not found', ar: 'project not found' }, req.lang));

  res.json({ message: 'success', data: project[0] });
};
