import { Contracts, MODELS, Project, ProjectView, SuccessResponse, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';

export const userAnalysisHandler: RequestHandler<
  unknown,
  SuccessResponse,
  unknown,
  unknown
> = async (req, res) => {
  // const userId = '662b93104566c8d2f8ed6aea';
  const userId = req.loggedUser.id;

  const userData = await Users.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(userId) },
    },
    {
      $lookup: {
        from: MODELS.category,
        localField: 'category',
        foreignField: '_id',
        as: 'categoryDetails',
      },
    },
    {
      $project: {
        profileViews: 1,
        likes: 1,
        rank: 1,
        projectsView: 1,
        category: {
          $ifNull: [
            {
              _id: { $arrayElemAt: ['$categoryDetails._id', 0] },
              title: { $arrayElemAt: [`$categoryDetails.title.${req.lang}`, 0] },
            },
            null,
          ],
        },
      },
    },
  ]);

  // get project views analysis
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

  const result = await ProjectView.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: oneYearAgo, $lte: now },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        totalViews: { $sum: '$count' },
      },
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
      },
    },
  ]);

  const userProjectViews = result.map((item) => ({
    year: item._id.year,
    month: item._id.month,
    totalViews: item.totalViews,
  }));

  // get top project views
  const projectViews = await ProjectView.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: '$project',
        totalViews: { $sum: '$count' },
        ref: { $first: '$ref' },
      },
    },
    {
      $sort: {
        totalViews: -1,
      },
    },
    {
      $limit: 3,
    },
    {
      $lookup: {
        from: MODELS.portfolioPost,
        let: { projectId: '$_id', ref: '$ref' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ['$_id', '$$projectId'] }, { $eq: ['$$ref', MODELS.portfolioPost] }],
              },
            },
          },
        ],
        as: 'portfolioPostDetails',
      },
    },
    {
      $lookup: {
        from: 'rentals',
        let: { projectId: '$_id', ref: '$ref' },
        pipeline: [
          {
            $match: {
              $expr: { $and: [{ $eq: ['$_id', '$$projectId'] }, { $eq: ['$$ref', 'rentals'] }] },
            },
          },
        ],
        as: 'studioBookingDetails',
      },
    },
    {
      $unwind: {
        path: '$portfolioPostDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$studioBookingDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        projectDetails: {
          $cond: {
            if: { $eq: ['$ref', MODELS.portfolioPost] },
            then: '$portfolioPostDetails',
            else: '$studioBookingDetails',
          },
        },
      },
    },
    {
      $addFields: {
        'projectDetails.cover': {
          $concat: [process.env.BUCKET_HOST, '/', '$projectDetails.cover'],
        },
        'projectDetails.attachments': {
          $map: {
            input: '$projectDetails.attachments',
            as: 'attachment',
            in: {
              $concat: [process.env.BUCKET_HOST, '/', '$$attachment'],
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        totalViews: 1,
        projectDetails: 1,
      },
    },
  ]);

  const topProjectViews = projectViews.map((item) => ({
    projectId: item._id,
    totalViews: item.totalViews,
    projectDetails: item.projectDetails,
  }));

  // analysis user based his category
  let userCategoryRank;
  if (userData && userData[0].category._id) {
    const userRankInHisCategoryPipeline: mongoose.PipelineStage[] = [
      {
        $match: { category: new mongoose.Types.ObjectId(userData[0].category._id) },
      },
      {
        $setWindowFields: {
          sortBy: { projectsView: -1 },
          output: {
            rank: { $rank: {} },
          },
        },
      },
      {
        $match: { _id: new mongoose.Types.ObjectId(userId) },
      },
      {
        $lookup: {
          from: MODELS.user,
          let: { userCategory: '$category' },
          pipeline: [
            { $match: { $expr: { $eq: ['$category', '$$userCategory'] } } },
            { $count: 'totalUsers' },
          ],
          as: 'totalUsers',
        },
      },
      {
        $addFields: {
          totalUsers: { $arrayElemAt: ['$totalUsers.totalUsers', 0] },
        },
      },
      {
        $project: {
          rank: 1,
          totalUsers: 1,
          percentile: { $multiply: [{ $divide: ['$rank', '$totalUsers'] }, 100] },
        },
      },
    ];

    const result = await Users.aggregate(userRankInHisCategoryPipeline).exec();

    // count project created today in the same user category
    const categoryObjectId = new mongoose.Types.ObjectId(userData[0].category._id);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $facet: {
          copyrights: [
            {
              $lookup: {
                from: MODELS.copyrights,
                localField: 'project.type',
                foreignField: '_id',
                as: 'populatedType',
              },
            },
            { $unwind: '$populatedType' },
            { $match: { 'populatedType.category': categoryObjectId } },
            { $count: 'count' },
          ],
          portfolioPosts: [
            {
              $lookup: {
                from: MODELS.portfolioPost,
                localField: 'project.type',
                foreignField: '_id',
                as: 'populatedType',
              },
            },
            { $unwind: '$populatedType' },
            { $match: { 'populatedType.category': categoryObjectId } },
            { $count: 'count' },
          ],
          rentals: [
            {
              $lookup: {
                from: 'rentals', // Assuming the collection name is 'rentals'
                localField: 'project.type',
                foreignField: '_id',
                as: 'populatedType',
              },
            },
            { $unwind: '$populatedType' },
            { $match: { 'populatedType.category': categoryObjectId } },
            { $count: 'count' },
          ],
        },
      },
      {
        $project: {
          total: {
            $sum: [
              { $arrayElemAt: ['$copyrights.count', 0] },
              { $arrayElemAt: ['$portfolioPosts.count', 0] },
              { $arrayElemAt: ['$rentals.count', 0] },
            ],
          },
        },
      },
    ];

    const counts = await Project.aggregate(pipeline).exec();

    userCategoryRank = {
      rank: result[0].rank || null,
      totalUsers: result[0].totalUsers || null,
      percentile: result[0].percentile || null,
      projectsToday: counts[0].total,
    };
  }

  // analysis user contracts

  const contracts = await Contracts.aggregate([
    {
      $match: {
        $or: [
          { customer: new mongoose.Types.ObjectId(userId) },
          { sp: new mongoose.Types.ObjectId(userId) },
        ],
      },
    },
    {
      $lookup: {
        from: MODELS.copyrightContract,
        localField: 'contract',
        foreignField: '_id',
        as: 'copyright_contract',
      },
    },
    {
      $lookup: {
        from: MODELS.rentalContract,
        localField: 'contract',
        foreignField: '_id',
        as: 'rental_contract',
      },
    },
    {
      $lookup: {
        from: MODELS.producerContract,
        localField: 'contract',
        foreignField: '_id',
        as: 'producer_contract',
      },
    },
    {
      $lookup: {
        from: MODELS.projectContract,
        localField: 'contract',
        foreignField: '_id',
        as: 'project_contracts',
      },
    },
    {
      $lookup: {
        from: MODELS.teamContract,
        localField: 'contract',
        foreignField: '_id',
        as: 'team_contracts',
      },
    },
    {
      $unwind: {
        path: '$producer_contract',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$team_contracts',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$project_contracts',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$rental_contract',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$copyright_contract',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $set: {
        contract: {
          $ifNull: [
            {
              $ifNull: [
                '$copyright_contract',
                {
                  $ifNull: [
                    '$producer_contract',
                    '$rental_contract',
                    '$project_contracts',
                    '$team_contracts',
                  ],
                },
              ],
            },
            null,
          ],
        },
      },
    },
    {
      $facet: {
        ongoing: [{ $match: { 'contract.status': 'ongoing' } }, { $count: 'count' }],
        pending: [{ $match: { 'contract.status': 'pending' } }, { $count: 'count' }],
        completed: [{ $match: { 'contract.status': 'completed' } }, { $count: 'count' }],
      },
    },
    {
      $project: {
        ongoingCount: {
          $ifNull: [{ $arrayElemAt: ['$ongoing.count', 0] }, 0],
        },
        pendingCount: {
          $ifNull: [{ $arrayElemAt: ['$pending.count', 0] }, 0],
        },
        completedCount: {
          $ifNull: [{ $arrayElemAt: ['$completed.count', 0] }, 0],
        },
      },
    },
  ]);

  res.status(200).json(<any>{
    message: 'success',
    data: {
      userData,
      userProjectViews,
      topProjectViews,
      userCategoryRank,
      contracts,
    },
  });
};
