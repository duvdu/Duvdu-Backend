import { MODELS, Rentals, Categories } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose, { PipelineStage } from 'mongoose';

export const getProjectsHandler: RequestHandler = async (req, res) => {
  let isInstant = undefined;
  if (req.pagination.filter.instant != undefined) isInstant = req.pagination.filter.instant;
  delete req.pagination.filter.instant;

  const pipelines: PipelineStage[] = [
    {
      $set: {
        subCategory: {
          title:`$subCategory.${req.lang}`,
          _id:'$subCategory._id',
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
  ];

  // Conditionally add the $match stage for isAvaliableToInstantProjects
  if (isInstant !== undefined) {
    pipelines.push({
      $match: {
        'userDetails.isAvaliableToInstantProjects': isInstant,
      },
    });
  }

  pipelines.push(
    {
      $set: {
        user: {
          _id: '$userDetails._id',
          username: '$userDetails.username',
          profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$userDetails.profileImage'] },
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
            in: { $concat: [process.env.BUCKET_HOST, '/', '$$attachment'] },
          },
        },
        cover: { $concat: [process.env.BUCKET_HOST, '/', '$cover'] },
      },
    },
    {
      $unset: ['userDetails', 'categoryDetails'],
    },
  );

  const projects = await Rentals.aggregate([
    {
      $match: {
        ...req.pagination.filter,
        isDeleted: { $ne: true },
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $skip: req.pagination.skip,
    },
    {
      $limit: req.pagination.limit,
    },
    ...pipelines,
    {
      $lookup: {
        from: 'favourites',
        localField: '_id',
        foreignField: 'project',
        as: 'favourite',
      },
    },
    {
      $addFields: {
        favouriteCount: { $size: '$favourite' },
      },
    },
    {
      $addFields: {
        isFavourite: {
          $cond: {
            if: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: '$favourite',
                      as: 'fav',
                      cond: {
                        $eq: [
                          '$$fav.user',
                          req.loggedUser?.id
                            ? new mongoose.Types.ObjectId(req.loggedUser.id as string)
                            : '0',
                        ],
                      },
                    },
                  },
                },
                0,
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        favourite: 0,
      },
    },
  ]);

  const count = await Rentals.aggregate([
    {
      $match: {
        ...req.pagination.filter,
        isDeleted: { $ne: true },
      },
    },
    ...pipelines,

    {
      $addFields: {
        isFavourite: {
          $cond: {
            if: {
              $eq: [
                '$favourite.user',
                req.loggedUser?.id ? new mongoose.Types.ObjectId(req.loggedUser.id as string) : '0',
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
  ]);

  const resultCount = count.length;

  // if (req.loggedUser?.id) {
  //   const user = await Users.findById(req.loggedUser.id, { favourites: 1 });

  //   projects.forEach((project) => {
  //     project.isFavourite = user?.favourites.some(
  //       (el: any) => el.project.toString() === project._id.toString(),
  //     );
  //   });
  // }

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

export const getProjectsPagination: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    search: string;
    location?: { lat: number; lng: number };
    equipments?: string[];
    category?: string;
    pricePerHourFrom?: number;
    pricePerHourTo?: number;
    insurance?: number;
    showOnHome?: boolean;
    startDate?: Date;
    endDate?: Date;
    tags?: string;
    subCategory?: string[];
    instant?: boolean;
    maxBudget?: number;
    minBudget?: number;
  }
> = async (req, res, next) => {
  if (req.query.maxBudget !== undefined) {
    req.pagination.filter.maxBudget = { $lte: req.query.maxBudget };
  }

  if (req.query.minBudget !== undefined) {
    req.pagination.filter.minBudget = { $gte: req.query.minBudget };
  }
  req.pagination.filter = {};

  if (req.query.instant != undefined) req.pagination.filter.instant = req.query.instant;
  if (req.query.search) {
    req.pagination.filter.$or = { $regex: req.query.search, $options: 'i' };
  }
  if (req.query.location) {
    req.pagination.filter.location = {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [req.query.location.lng, req.query.location.lat],
        },
      },
    };
  }
  if (req.query.equipments) {
    req.pagination.filter['equipments.name'] = { $in: req.query.equipments };
  }
  if (req.query.pricePerHourFrom || req.query.pricePerHourTo) {
    req.pagination.filter['projectScale.pricerPerUnit'] = {};
    if (req.query.pricePerHourFrom) {
      req.pagination.filter['projectScale.pricerPerUnit'].$gte = req.query.pricePerHourFrom;
    }
    if (req.query.pricePerHourTo) {
      req.pagination.filter['projectScale.pricerPerUnit'].$lte = req.query.pricePerHourTo;
    }
  }
  if (req.query.showOnHome !== undefined) {
    req.pagination.filter.showOnHome = req.query.showOnHome;
  }
  if (req.query.startDate || req.query.endDate) {
    req.pagination.filter.createdAt = {
      $gte: req.query.startDate || new Date(0),
      $lte: req.query.endDate || new Date(),
    };
  }
  if (req.query.category) req.pagination.filter.category = { $in: req.query.category };

  if (req.query.subCategory) {
    const subCategoryIds = req.query.subCategory.map((id) => new mongoose.Types.ObjectId(id));
    // Step 1: Retrieve the subcategory titles from the Category model
    const subCategories = await Categories.aggregate([
      { $unwind: '$subCategories' },
      { $match: { 'subCategories._id': { $in: subCategoryIds } } },
      {
        $project: {
          _id: 0,
          'title.ar': '$subCategories.title.ar',
          'title.en': '$subCategories.title.en',
        },
      },
    ]);

    // Construct the filter for the subCategory titles in both Arabic and English
    const arabicTitles = subCategories.map((subCat) => subCat.title.ar);
    const englishTitles = subCategories.map((subCat) => subCat.title.en);

    // Ensure that at least one of the title arrays has content
    req.pagination.filter['$or'] = [
      { 'subCategory.ar': { $in: arabicTitles } },
      { 'subCategory.en': { $in: englishTitles } },
    ];
  }

  if (req.query.tags) {
    req.pagination.filter['tags._id'] = { $in: req.query.tags };
  }
  next();
};
