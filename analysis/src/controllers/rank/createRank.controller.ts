import 'express-async-errors';

import { Irank, Rank, SuccessResponse, recalculateAllUsersRanks } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const createRankHandler: RequestHandler<
  unknown,
  SuccessResponse<{ data: Irank }>,
  Pick<Irank, 'actionCount' | 'rank' | 'color' | 'projectsLiked' | 'projectsCount'>,
  unknown
> = async (req, res) => {
  const rank = await Rank.create(req.body);
  
  // Recalculate all users' ranks after creating a new rank
  // This ensures all users get updated to the new rank if they qualify
  await recalculateAllUsersRanks();
  
  res.status(201).json({ message: 'success', data: rank });
};
