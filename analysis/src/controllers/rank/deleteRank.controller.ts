import 'express-async-errors';

import { NotFound, Rank, SuccessResponse, recalculateAllUsersRanks } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';


export const deleteRankHandler: RequestHandler<
  { rankId: string },
  SuccessResponse,
  unknown,
  unknown
> = async (req, res) => {
  // First, get the rank to be deleted to retrieve its title
  const rankToDelete = await Rank.findByIdAndDelete(req.params.rankId);
  
  if (!rankToDelete) 
    throw new NotFound({ar:'رتبة غير موجودة',en:'Rank not found'} , req.lang);

  // Update all users who have this rank before deleting it
  await recalculateAllUsersRanks();

  
  res.status(204).json({ message: 'success' });
};
