import 'express-async-errors';
import { BadRequestError } from '@duvdu-v1/duvdu';

import { Term } from '../../models/Term.model';
import { CreateTermHandler } from '../../types/endpoints/terms.endpoints';


export const createTermHandler:CreateTermHandler = async (req,res,next)=>{
  const term = await Term.find();
  if (term.length > 0) return next(new BadRequestError('term is already exist'));
  await Term.create(req.body);
  res.status(201).json({message:'success'});
};