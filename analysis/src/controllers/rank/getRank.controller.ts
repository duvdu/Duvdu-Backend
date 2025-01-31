import 'express-async-errors';

import { Irank, NotFound, Rank, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const getRankHandler: RequestHandler<
  { rankId: string },
  SuccessResponse<{ data: Irank }>,
  unknown,
  unknown
> = async (req, res, next) => {
  const rank = await Rank.findById(req.params.rankId);

  if (!rank) return next(new NotFound({ en: 'rank not found', ar: 'الترتيب غير موجود' }, req.lang));

  res.status(200).json({ message: 'success', data: rank });
};
