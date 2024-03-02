import 'express-async-errors';
import { NotFound } from '@duvdu-v1/duvdu';

import { Term } from '../../models/Term.model';
import { GetTermHandler } from '../../types/endpoints/terms.endpoints';


export const getTermHandler:GetTermHandler = async (req,res,next)=>{
  const term = await Term.find();
  if (term.length === 0) return next(new NotFound('term not found'));
  res.status(200).json({message:'success' , data:term[0]});
};