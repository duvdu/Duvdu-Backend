import { SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { PipelineStage } from 'mongoose';

import { CopyRights } from '../../models/copyrights.model';

export const getProjectAnalysis: RequestHandler<
  unknown,
  SuccessResponse<{ data: any }>,
  unknown,
  { startDate?: Date; endDate?: Date }
> = async (req, res) => {
  const matchedPeriod: any = {};
  if (req.query.startDate || req.query.endDate)
    matchedPeriod.createdAt = {
      $gte: req.query.startDate || new Date(0),
      $lte: req.query.endDate || new Date(),
    };

  // total count
  const totalCount = await CopyRights.countDocuments(matchedPeriod);
  // top users
  // const topUsersPipelines: PipelineStage[] = [
  //   { $group: { _id: '$user', totalProjects: { $sum: 1 } } },
  //   {
  //     $lookup: {
  //       from: MODELS.user,
  //       localField: '_id',
  //       foreignField: '_id',
  //       as: 'userDetails',
  //     },
  //   },
  //   {
  //     $project: {
  //       _id: 1,
  //       totalProjects: 1,
  //       'userDetails.username': 1,
  //       'userDetails.profileImage': 1,
  //     },
  //   },
  //   { $unwind: '$userDetails' },
  //   {
  //     $project: {
  //       _id: 1,
  //       totalProjects: 1,
  //       username: '$userDetails.username', // Extract username
  //       profileImage: '$userDetails.profileImage', // Extract profileImage
  //     },
  //   },
  //   { $sort: { totalProjects: -1 } },
  //   { $limit: 10 },
  // ];
  // if (matchedPeriod.createdAt) topUsersPipelines.unshift({ $match: matchedPeriod });
  // const topUsers = await CopyRights.aggregate(topUsersPipelines);
  // top addresses
  const topAddressesPipelines: PipelineStage[] = [
    { $group: { _id: '$address', totalProjects: { $sum: 1 } } },
    { $sort: { totalProjects: -1 } },
  ];
  if (matchedPeriod.createdAt) topAddressesPipelines.unshift({ $match: matchedPeriod });
  const addressStats = await CopyRights.aggregate(topAddressesPipelines);
  // budget
  const budgetStatsPipelines: PipelineStage[] = [
    { $group: { _id: null, totalBudget: { $sum: '$price' }, count: { $sum: 1 } } },
  ];
  if (matchedPeriod.createdAt) budgetStatsPipelines.unshift({ $match: matchedPeriod });
  const budgetStats = await CopyRights.aggregate(budgetStatsPipelines);
  const totalBudget = budgetStats.length > 0 ? budgetStats[0] : 0;
  // show on home
  const showOnHomeFilter: any = { showOnHome: true };
  if (matchedPeriod.createdAt) showOnHomeFilter.createdAt = matchedPeriod.createdAt;
  const showOnHomeCount = await CopyRights.countDocuments(showOnHomeFilter);
  console.log(showOnHomeCount, showOnHomeFilter);
  // deleted accounts
  const deletedProjectFilter: any = { isDeleted: true };
  if (matchedPeriod.createdAt) deletedProjectFilter.createdAt = matchedPeriod.createdAt;
  const deletedProjectsCount = await CopyRights.countDocuments(deletedProjectFilter);

  res.status(200).json({
    message: 'success',
    data: {
      totalCount,
      // topUsers,
      addressStats,
      totalBudget,
      showOnHomeCount,
      deletedProjectsCount,
    },
  });
};
