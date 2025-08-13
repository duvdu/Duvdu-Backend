import 'express-async-errors';

import { NotFound, Rank, SuccessResponse, updateUsersAfterRankDeletion } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';


export const deleteRankHandler: RequestHandler<
  { rankId: string },
  SuccessResponse,
  unknown,
  unknown
> = async (req, res) => {
  // First, get the rank to be deleted to retrieve its title
  const rankToDelete = await Rank.findById(req.params.rankId);
  
  if (!rankToDelete) 
    throw new NotFound({ar:'رتبة غير موجودة',en:'Rank not found'} , req.lang);

  // Update all users who have this rank before deleting it
  await updateUsersAfterRankDeletion(rankToDelete.rank);

  // Now delete the rank
  await Rank.findByIdAndDelete(req.params.rankId);
  
  res.status(204).json({ message: 'success' });
};
