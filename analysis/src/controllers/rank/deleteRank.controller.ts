import 'express-async-errors';

import { Rank } from '@duvdu-v1/duvdu';

import { DeleteRankHandler } from '../../types/endpoints/rank.endpoints';

export const deleteRankHandler: DeleteRankHandler = async (req, res) => {
  await Rank.findByIdAndDelete(req.params.rankId);
  res.status(204).json({ message: 'success' });
};
