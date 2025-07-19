import 'express-async-errors';

import { Irank, NotFound, Rank, recalculateAllUsersRanks, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const updateRankHandler: RequestHandler<
  { rankId: string },
  SuccessResponse<{ data: Irank }>,
  Partial<Pick<Irank, 'actionCount' | 'rank' | 'color' | 'projectsCount' | 'projectsLiked'>>,
  unknown
> = async (req, res, next) => {
  const updatedRank = await Rank.findByIdAndUpdate(req.params.rankId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedRank)
    return next(new NotFound({ en: 'rank not found', ar: 'الترتيب غير موجود' }, req.lang));

  // Recalculate all users ranks
  await recalculateAllUsersRanks();

  res.status(200).json({ message: 'success', data: updatedRank });
};
