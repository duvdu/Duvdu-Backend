import { MODELS, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { PipelineStage } from 'mongoose';

import { Rentals } from '../../models/rental.model';

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

  const totalCount = await Rentals.countDocuments(matchedPeriod);

  const topUsersPipeline: PipelineStage[] = [
    { $group: { _id: '$user', totalBookings: { $sum: 1 } } },
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
        totalBookings: 1,
        'userDetails.username': 1,
        'userDetails.profileImage': 1,
      },
    },
    { $unwind: '$userDetails' },
    {
      $project: {
        _id: 1,
        totalBookings: 1,
        username: '$userDetails.username',
        profileImage: '$userDetails.profileImage',
      },
    },
    { $sort: { totalBookings: -1 } },
    { $limit: 10 },
  ];
  if (matchedPeriod.createdAt) topUsersPipeline.unshift({ $match: matchedPeriod });
  const topUsers = await Rentals.aggregate(topUsersPipeline);

  const topAddressesPipeline: PipelineStage[] = [
    { $group: { _id: '$location', totalBookings: { $sum: 1 } } },
    { $sort: { totalBookings: -1 } },
  ];
  if (matchedPeriod.createdAt) topAddressesPipeline.unshift({ $match: matchedPeriod });
  const addressStats = await Rentals.aggregate(topAddressesPipeline);

  const priceStatsPipeline: PipelineStage[] = [
    { $group: { _id: null, totalPrices: { $sum: '$pricePerHour' }, count: { $sum: 1 } } },
  ];
  if (matchedPeriod.createdAt) priceStatsPipeline.unshift({ $match: matchedPeriod });
  const priceStats = await Rentals.aggregate(priceStatsPipeline);
  const totalPrice = priceStats.length > 0 ? priceStats[0].totalPrices : 0;

  const showOnHomeCount = await Rentals.countDocuments({
    showOnHome: true,
    ...matchedPeriod,
  });

  const deletedBookingsCount = await Rentals.countDocuments({
    isDeleted: true,
    ...matchedPeriod,
  });

  res.status(200).json({
    message: 'success',
    data: {
      totalCount,
      topUsers,
      addressStats,
      totalPrice,
      showOnHomeCount,
      deletedBookingsCount,
    },
  });
};
