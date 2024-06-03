import { NotFound, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';

import { Isession, Sessions } from '../../model/session.model';

export const getUserSession: RequestHandler<
  { userId: string },
  SuccessResponse<{ data: { totalDuration: number; session: Isession } }>
> = async (req, res, next) => {
  const userSession = await Sessions.aggregate([
    { $match: { user: new Types.ObjectId(req.params.userId) } },
    {
      $project: {
        user: 1,
        sessions: {
          $slice: ['$sessions', req.pagination.skip, req.pagination.limit],
        },
      },
    },
  ]);
  if (!userSession)
    return next(new NotFound({ en: 'user not found', ar: 'user not found' }, req.lang));

  const totalDuration = await Sessions.aggregate([
    { $match: { user: new Types.ObjectId(req.params.userId) } },
    { $unwind: '$sessions' },
    {
      $group: {
        _id: '$user',
        totalDuration: { $sum: '$sessions.duration' },
      },
    },
  ]);

  res.status(200).json({
    message: 'success',
    data: { totalDuration: totalDuration?.[0]?.totalDuration || 0, session: userSession[0] },
  });
};
