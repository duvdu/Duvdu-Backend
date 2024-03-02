import 'express-async-errors';
import { NotFound } from '@duvdu-v1/duvdu';

import { Term } from '../../models/Term.model';
import { UpdateTermHandler } from '../../types/endpoints/terms.endpoints';



export const updateTermHandler:UpdateTermHandler = async (req,res,next)=>{
  const updatedTerm = await Term.findByIdAndUpdate(
    req.params.termId,
    req.body,
    {new:true}
  );
  if (!updatedTerm) return next(new NotFound('term not found'));
  res.status(200).json({message:'success'});
};