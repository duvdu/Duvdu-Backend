import 'express-async-errors';

import { Rank, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const deleteRankHandler: RequestHandler<
  { rankId: string },
  SuccessResponse,
  unknown,
  unknown
> = async (req, res) => {
  await Rank.findByIdAndDelete(req.params.rankId);
  res.status(204).json({ message: 'success' });
};
