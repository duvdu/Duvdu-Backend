import 'express-async-errors';
import { NotFound, Term } from '@duvdu-v1/duvdu';

import { GetTermHandler } from '../../types/endpoints/terms.endpoints';

export const getTermHandler: GetTermHandler = async (req, res, next) => {
  const term = await Term.aggregate([
    {
      $project: {
        _id: 1,
        desc: `$desc.${req.lang}`,
      },
    },
  ]);
  if (term.length === 0) return next(new NotFound(undefined, req.lang));
  res.status(200).json({ message: 'success', data: term[0] });
};
