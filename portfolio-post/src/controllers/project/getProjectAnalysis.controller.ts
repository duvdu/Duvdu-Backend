import { MODELS, ProjectCycle, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { PipelineStage } from 'mongoose';

export const getProjectAnalysis: RequestHandler<
  unknown,
  SuccessResponse<{ data: any }>,
  unknown,
  { startDate?: Date; endDate?: Date }
> = async (req, res) => {
  const matchedPeriod: any = {};
  if (req.query.startDate || req.query.endDate) {
    matchedPeriod.createdAt = {
      $gte: req.query.startDate || new Date(0),
      $lte: req.query.endDate || new Date(),
    };
  }

  const totalCount = await ProjectCycle.countDocuments(matchedPeriod);

  const topUsersPipeline: PipelineStage[] = [
    { $group: { _id: '$user', totalProjects: { $sum: 1 } } },
    {
      $lookup: {
        from: MODELS.user,
        localField: '_id',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $project: {
        _id: 1,
        totalProjects: 1,
        'userDetails.username': 1,
        'userDetails.profileImage': 1,
      },
    },
    { $unwind: '$userDetails' },
    {
      $project: {
        _id: 1,
        totalProjects: 1,
        username: '$userDetails.username',
        profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$userDetails.profileImage'] },
      },
    },
    { $sort: { totalProjects: -1 } },
    { $limit: 10 },
  ];
  if (matchedPeriod.createdAt) topUsersPipeline.unshift({ $match: matchedPeriod });
  const topUsers = await ProjectCycle.aggregate(topUsersPipeline);

  const topAddressesPipeline: PipelineStage[] = [
    { $group: { _id: { location: '$location', address: '$address' }, totalProjects: { $sum: 1 } } },
    { $sort: { totalProjects: -1 } },
    { 
      $project: { 
        _id: 0, 
        location: '$_id.location', 
        address: '$_id.address', 
        totalProjects: 1 
      } 
    }
  ];
  if (matchedPeriod.createdAt) topAddressesPipeline.unshift({ $match: matchedPeriod });
  const addressStats = await ProjectCycle.aggregate(topAddressesPipeline);

  const showOnHomeCount = await ProjectCycle.countDocuments({
    showOnHome: true,
    ...matchedPeriod,
  });

  const deletedProjectsCount = await ProjectCycle.countDocuments({
    isDeleted: true,
    ...matchedPeriod,
  });

  res.status(200).json({
    message: 'success',
    data: {
      totalCount,
      topUsers,
      addressStats,
      showOnHomeCount,
      deletedProjectsCount,
    },
  });
};
