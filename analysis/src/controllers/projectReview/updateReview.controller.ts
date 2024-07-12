import 'express-async-errors';

import { NotAllowedError, NotFound, ProjectReview } from '@duvdu-v1/duvdu';

import { UpdateProjectViewHandler } from '../../types/endpoints/projectView.endpoints';



export const updateProjectReviewHandler:UpdateProjectViewHandler = async (req,res,next)=>{
  const review = await ProjectReview.findById(req.params.reviewId);
  if (!review) 
    return next(new NotFound({en:'review not found' , ar:'لم يتم العثور على المراجعة'} , req.lang));

  if (review.user.toString() != req.loggedUser.id) 
    return next(new NotAllowedError(undefined , req.lang));

  const updatedReview = await ProjectReview.findByIdAndUpdate(req.params.reviewId , req.body , {new:true});

  res.status(200).json({message:'success' , data:updatedReview!});
};