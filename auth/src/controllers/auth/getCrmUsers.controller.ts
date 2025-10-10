import { Iuser, MODELS, PaginationResponse, Roles, SystemRoles, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose, { PipelineStage } from 'mongoose';

export const filterCrmUsers: RequestHandler<
  unknown,
  unknown,
  unknown,
  {
    search?: string;
    username?: string;
    phoneNumber?: string;
    category?: string;
    priceFrom?: number;
    priceTo?: number;
    hasVerificationPadge?: boolean;
    isBlocked?: boolean;
    isAdmin?: boolean;
    maxDistance?: number;
    role?: string;
    isOnline?: boolean;
    isDeleted?: boolean;
    from?: Date;
    to?: Date;
  }
> = async (req, res, next) => {
  if (req.query.search) {
    req.pagination.filter.$or = [
      { 'phoneNumber.number': { $regex: `\\b${req.query.search}\\b`, $options: 'i' } },
      { username: { $regex: `${req.query.search}`, $options: 'i' } },
      { name: { $regex: `${req.query.search}`, $options: 'i' } },
      { email: { $regex: `${req.query.search}`, $options: 'i' } },
    ];
  }
  if (req.query.username) req.pagination.filter.username = req.query.username;
  if (req.query.phoneNumber) req.pagination.filter['phoneNumber.number'] = req.query.phoneNumber;
  if (req.query.category)
    req.pagination.filter.categories = {
      $in: [new mongoose.Types.ObjectId(req.query.category)],
    };

  if (req.query.priceFrom) req.pagination.filter.price = { $gte: req.query.priceFrom };
  if (req.query.priceTo)
    req.pagination.filter.price = { ...req.pagination.filter.price, $lte: req.query.priceTo };
  if (req.query.hasVerificationPadge !== undefined)
    req.pagination.filter.hasVerificationBadge = req.query.hasVerificationPadge;
  if (req.query.isBlocked !== undefined)
    req.pagination.filter['isBlocked.value'] = req.query.isBlocked;
  if (req.query.isOnline !== undefined) req.pagination.filter.isOnline = req.query.isOnline;

  if (req.query.isAdmin != undefined) {
    const roles = await Roles.find({
      key: { $in: [SystemRoles.unverified, SystemRoles.verified] },
    });
    if (req.query.isAdmin) {
      req.pagination.filter.role = {
        $nin: roles.map((role) => role._id),
      };
    } else {
      req.pagination.filter.role = {
        $in: roles.map((role) => role._id),
      };
    }
  }

  if (req.query.role) req.pagination.filter.role = new mongoose.Types.ObjectId(req.query.role);

  req.query.maxDistance = +(req.query.maxDistance || 1000);

  if (req.query.isDeleted !== undefined) req.pagination.filter.isDeleted = req.query.isDeleted;

  // Handle date range filtering (inclusive of both start and end dates)
  // If start date equals end date, this will return all records from that entire day
  if (req.query.from) {
    const startDate = new Date(req.query.from);
    // Set the time to start of day (00:00:00.000) to include the entire start date
    startDate.setHours(0, 0, 0, 0);
    req.pagination.filter.createdAt = { $gte: startDate };
  }
  if (req.query.to) {
    const endDate = new Date(req.query.to);
    // Set the time to end of day (23:59:59.999) to include the entire end date
    endDate.setHours(23, 59, 59, 999);
    req.pagination.filter.createdAt = { ...req.pagination.filter.createdAt, $lte: endDate };
  }

  next();
};

export const getCrmUsers: RequestHandler<unknown, PaginationResponse<{ data: Iuser[] }>> = async (
  req,
  res,
) => {
  const aggregationPipeline: PipelineStage[] = [];

  // Add filtering and matching stages
  aggregationPipeline.push(
    {
      $match: {
        ...req.pagination.filter,
        _id: { $ne: new mongoose.Types.ObjectId(req.loggedUser?.id) },
      },
    },
    {
      $lookup: {
        from: MODELS.role,
        localField: 'role',
        foreignField: '_id',
        as: 'roleDetails',
      },
    },
    {
      $unwind: {
        path: '$roleDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        googleId: 1,
        appleId: 1,
        email: 1,
        name: 1,
        isDeleted: 1,
        phoneNumber: 1,
        username: 1,
        isVerified: 1,
        profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$profileImage'] },
        coverImage: { $concat: [process.env.BUCKET_HOST, '/', '$coverImage'] },
        faceRecognition: { $concat: [process.env.BUCKET_HOST, '/', '$faceRecognition'] },
        location: 1,
        acceptedProjectsCounter: 1,
        about: 1,
        isOnline: 1,
        isAvaliableToInstantProjects: 1,
        pricePerHour: 1,
        role: {
          $cond: {
            if: { $eq: ['$roleDetails.system', null] },
            then: null,
            else: '$roleDetails',
          },
        },
        hasVerificationBadge: 1,
        avaliableContracts: 1,
        rate: 1,
        isBlocked: 1,
        followCount: 1,
        address: 1,
        likes: 1,
        rank: 1,
        profileViews: 1,
        projectsView: 1,
        haveInvitation: 1,
        projectsCount: 1,
        actualProjectsCount: 1,
        categories: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $lookup: {
        from: MODELS.category,
        localField: 'categories',
        foreignField: '_id',
        as: 'categoryDetails',
      },
    },
    {
      $addFields: {
        categories: {
          $map: {
            input: '$categoryDetails',
            as: 'categoryDetail',
            in: {
              _id: '$$categoryDetail._id',
              title: {
                $cond: {
                  if: { $eq: [req.lang, 'ar'] },
                  then: '$$categoryDetail.title.ar',
                  else: '$$categoryDetail.title.en',
                },
              },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: MODELS.follow,
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$following', '$$userId'] },
                  { $eq: ['$follower', new mongoose.Types.ObjectId(req.loggedUser?.id)] },
                ],
              },
            },
          },
        ],
        as: 'isFollow',
      },
    },
    {
      $addFields: {
        isFollow: { $gt: [{ $size: '$isFollow' }, 0] },
      },
    },
    {
      $project: {
        canChatDetails: 0,
        categoryDetails: 0,
      },
    },
    {
      $facet: {
        totalCount: [{ $count: 'totalCount' }],
        users: [{ $skip: req.pagination.skip }, { $limit: req.pagination.limit }],
      },
    },
  );

  // Execute aggregation pipeline
  const users = await Users.aggregate(aggregationPipeline);
  const resultCount = users[0]?.totalCount[0]?.totalCount || 0;

  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: users[0].users,
  });
};
