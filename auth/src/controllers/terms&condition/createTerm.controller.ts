import 'express-async-errors';
import { BadRequestError, Term } from '@duvdu-v1/duvdu';

import { CreateTermHandler } from '../../types/endpoints/terms.endpoints';

export const createTermHandler: CreateTermHandler = async (req, res, next) => {
  const term = await Term.find();
  if (term.length > 0)
    return next(new BadRequestError({ en: 'term is already exist', ar: 'موجود بالغعل' }, req.lang));
  await Term.create(req.body);
  res.status(201).json({ message: 'success' });
};
