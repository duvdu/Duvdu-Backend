import { MODELS, Users, Rentals } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getProjectsCrmHandler: RequestHandler = async (req, res) => {
  const pipelines = [
    {
      $set: {
        subCategory: {
          $cond: {
            if: { $eq: [req.lang, 'en'] },
            then: '$subCategory.en',
            else: '$subCategory.ar',
          },
        },
        tags: {
          $map: {
            input: '$tags',
            as: 'tag',
            in: {
              _id: '$$tag._id',
              title: {
                $cond: {
                  if: { $eq: [req.lang, 'en'] },
                  then: '$$tag.en',
                  else: '$$tag.ar',
                },
              },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: MODELS.category,
        localField: 'category',
        foreignField: '_id',
        as: 'categoryDetails',
      },
    },
    { $unwind: '$categoryDetails' },
    {
      $set: {
        category: {
          _id: '$categoryDetails._id',
          image: { $concat: [process.env.BUCKET_HOST, '/', '$categoryDetails.image'] },
          insurance: {
            $ifNull: ['$categoryDetails.insurance', false],
          },
          title: {
            $cond: {
              if: { $eq: [req.lang, 'ar'] },

              then: '$categoryDetails.title.ar',
              else: '$categoryDetails.title.en',
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    { $unwind: '$userDetails' },
    {
      $set: {
        user: {
          _id: '$userDetails._id',
          username: '$userDetails.username',
          profileImage: {
            $concat: [process.env.BUCKET_HOST, '/', '$userDetails.profileImage'],
          },
          coverImage: { $concat: [process.env.BUCKET_HOST, '/', '$userDetails.coverImage'] },
          isOnline: '$userDetails.isOnline',
          acceptedProjectsCounter: '$userDetails.acceptedProjectsCounter',
          name: '$userDetails.name',
          rate: '$userDetails.rate',
          rank: '$userDetails.rank',
          projectsView: '$userDetails.projectsView',
          profileViews: '$userDetails.profileViews',
          about: '$userDetails.about',
          isAvaliableToInstantProjects: '$userDetails.isAvaliableToInstantProjects',
          pricePerHour: '$userDetails.pricePerHour',
          hasVerificationBadge: '$userDetails.hasVerificationBadge',
          likes: '$userDetails.likes',
          followCount: '$userDetails.followCount',
          address: '$userDetails.address',
        },
        attachments: {
          $map: {
            input: '$attachments',
            as: 'attachment',
            in: {
              $concat: [process.env.BUCKET_HOST, '/', '$$attachment'],
            },
          },
        },
        cover: {
          $concat: [process.env.BUCKET_HOST, '/', '$cover'],
        },
      },
    },
    {
      $unset: ['userDetails', 'categoryDetails'],
    },
  ];

  const resultCount = await Rentals.countDocuments({
    ...req.pagination.filter,
    isDeleted: { $ne: true },
  });

  const projects = await Rentals.aggregate([
    {
      $match: req.pagination.filter,
    },
    { $sort: { createdAt: -1 } },
    {
      $skip: req.pagination.skip,
    },
    {
      $limit: req.pagination.limit,
    },
    ...pipelines,
  ]);

  if (req.loggedUser?.id) {
    const user = await Users.findById(req.loggedUser.id, { favourites: 1 });

    projects.forEach((project) => {
      project.isFavourite = user?.favourites.some(
        (el: any) => el.project.toString() === project._id.toString(),
      );
    });
  }

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: projects,
  });
};
