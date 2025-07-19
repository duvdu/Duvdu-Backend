import 'express-async-errors';

import { Irank, Rank, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const createRankHandler: RequestHandler<
  unknown,
  SuccessResponse<{ data: Irank }>,
  Pick<Irank, 'actionCount' | 'rank' | 'color' | 'projectsLiked' | 'projectsCount'>,
  unknown
> = async (req, res) => {
  const rank = await Rank.create(req.body);
  res.status(201).json({ message: 'success', data: rank });
};
