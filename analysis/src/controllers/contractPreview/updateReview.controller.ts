import 'express-async-errors';

import { ContractReview, NotAllowedError, NotFound } from '@duvdu-v1/duvdu';

import { UpdateReviewHandler } from '../../types/endpoints/contractReview.endpoints';



export const updateReviewHandler:UpdateReviewHandler = async (req,res,next)=>{
  const review = await ContractReview.findById(req.params.reviewId);

  if (!review) 
    return next(new NotFound({en:'review not found' , ar:'لم يتم العثور على المراجعة'} , req.lang));
    
  if (review.user.toString() != req.loggedUser.id) 
    return next(new NotAllowedError(undefined , req.lang));

  const updatedReview = await ContractReview.findByIdAndUpdate(req.params.reviewId , req.body , {new:true});

  res.status(200).json({message:'success' , data:updatedReview!});
};