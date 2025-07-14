import {
  Contracts,
  Iuser,
  MODELS,
  PaginationResponse,
  Users,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import mongoose, { PipelineStage, Document } from 'mongoose';
  
export const getCrmUsers: RequestHandler<unknown, PaginationResponse<{ data: Iuser[] }>> = async (
  req,
  res,
) => {
  const currentUser = await Users.findById(req.loggedUser?.id, { location: 1 });
  
  const aggregationPipeline: PipelineStage[] = [];
  
  // Add $geoNear if user location exists
  if (currentUser?.location?.coordinates) {
    aggregationPipeline.push({
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: currentUser.location.coordinates,
        },
        distanceField: 'distance', // Rename 'string' to 'distance'
        maxDistance: (req.query.maxDistance as unknown as number) * 1000, // Convert km to meters
        spherical: true,
      },
    });
  }
  
  // Add filtering and matching stages
  aggregationPipeline.push(
    {
      $match: {
        ...req.pagination.filter,
        _id: { $ne: new mongoose.Types.ObjectId(req.loggedUser?.id) },
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
        role: 1,
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
        categories: 1,
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
  
  const processedUsers = await Promise.all(
    users[0].users.map(async (user: Iuser & Document) => {
      // Check contract status using simple query
      const contract = await Contracts.findOne({
        $or: [
          { sp: req.loggedUser?.id, customer: user._id },
          { sp: user._id, customer: req.loggedUser?.id },
        ],
      }).populate({
        path: 'contract',
        match: {
          status: {
            $nin: ['canceled', 'pending', 'rejected', 'reject', 'cancel'],
          },
        },
      });
      return {
        ...user,
        canChat: !!contract?.contract, // Will be true if valid contract exists
      };
    }),
  );
  
  res.status(200).json({
    message: 'success',
    pagination: {
      currentPage: req.pagination.page,
      resultCount,
      totalPages: Math.ceil(resultCount / req.pagination.limit),
    },
    data: processedUsers,
  });
};
  