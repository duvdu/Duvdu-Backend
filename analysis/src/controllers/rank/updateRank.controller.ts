import 'express-async-errors';

import { NotFound, Rank } from '@duvdu-v1/duvdu';

import { UpdateRankHandler } from '../../types/endpoints/rank.endpoints';

export const updateRankHandler: UpdateRankHandler = async (req, res, next) => {
  const updatedRank = await Rank.findByIdAndUpdate(req.params.rankId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedRank)
    return next(new NotFound({ en: 'rank not found', ar: 'الترتيب غير موجود' }, req.lang));

  res.status(200).json({ message: 'success', data: updatedRank });
};
