import { MODELS, SuccessResponse, TeamProject } from '@duvdu-v1/duvdu';
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
    matchedPeriod.startDate = {
      $gte: req.query.startDate || new Date(0),
      $lte: req.query.endDate || new Date(),
    };
  }

  const totalCount = await TeamProject.countDocuments(matchedPeriod);

  const topUsersPipeline: PipelineStage[] = [
    { $unwind: '$creatives' },
    { $unwind: '$creatives.users' },
    { $group: { _id: '$creatives.users.user', totalProjects: { $sum: 1 } } },
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
        profileImage: '$userDetails.profileImage',
      },
    },
    { $sort: { totalProjects: -1 } },
    { $limit: 10 },
  ];
  if (matchedPeriod.startDate) topUsersPipeline.unshift({ $match: matchedPeriod });
  const topUsers = await TeamProject.aggregate(topUsersPipeline);

  const topAddressesPipeline: PipelineStage[] = [
    { $group: { _id: '$address', totalProjects: { $sum: 1 } } },
    { $sort: { totalProjects: -1 } },
  ];
  if (matchedPeriod.startDate) topAddressesPipeline.unshift({ $match: matchedPeriod });
  const addressStats = await TeamProject.aggregate(topAddressesPipeline);

  const totalBudgetPipeline: PipelineStage[] = [
    { $group: { _id: null, totalBudget: { $sum: '$budget' } } },
  ];
  if (matchedPeriod.startDate) totalBudgetPipeline.unshift({ $match: matchedPeriod });
  const totalBudgetResult = await TeamProject.aggregate(totalBudgetPipeline);
  const totalBudget = totalBudgetResult.length > 0 ? totalBudgetResult[0].totalBudget : 0;

  const showOnHomeCount = await TeamProject.countDocuments({
    showOnHome: true,
    ...matchedPeriod,
  });

  const deletedProjectsCount = await TeamProject.countDocuments({
    isDeleted: true,
    ...matchedPeriod,
  });

  res.status(200).json({
    message: 'success',
    data: {
      totalCount,
      topUsers,
      addressStats,
      totalBudget,
      showOnHomeCount,
      deletedProjectsCount,
    },
  });
};
