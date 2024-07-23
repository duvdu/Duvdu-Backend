import 'express-async-errors';

import { NotFound, Rank } from '@duvdu-v1/duvdu';

import { GetRankHandler } from '../../types/endpoints/rank.endpoints';

export const getRankHandler: GetRankHandler = async (req, res, next) => {
  const rank = await Rank.findById(req.params.rankId);

  if (!rank) return next(new NotFound({ en: 'rank not found', ar: 'الترتيب غير موجود' }, req.lang));

  res.status(200).json({ message: 'success', data: rank });
};
