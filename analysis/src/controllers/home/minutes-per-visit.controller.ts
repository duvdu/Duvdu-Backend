import { Sessions } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getMinutesPerVisitByDayAndLocation: RequestHandler = async (req, res) => {
  const day = req.query.day;
  const result = await Sessions.aggregate([
    { $unwind: '$sessions' },
    {
      $project: {
        user: 1,
        date: { $dateToString: { format: '%Y-%m-%d', date: '$sessions.startAt' } },
        durationInMinutes: {
          $divide: [{ $subtract: ['$sessions.endAt', '$sessions.startAt'] }, 1000 * 60],
        },
      },
    },
    {
      $group: {
        _id: {
          user: '$user',
          date: '$date',
        },
        totalMinutes: { $sum: '$durationInMinutes' },
      },
    },
    {
      $group: {
        _id: '$_id.date',
        totalMinutesPerDay: { $sum: '$totalMinutes' },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  if (day) return res.json(result.find((el) => el._id === day));
  res.status(200).json(result);
};
