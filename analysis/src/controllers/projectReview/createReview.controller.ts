import 'express-async-errors';

import { BadRequestError, ProjectReview } from '@duvdu-v1/duvdu';

import { CreateProjectReviewHandler } from '../../types/endpoints/projectView.endpoints';



export const createProjectReviewHandler:CreateProjectReviewHandler = async (req,res,next)=>{
  const review = await ProjectReview.findOne({user:req.loggedUser.id , project:req.body.project});

  if (review) 
    return next(new BadRequestError({en:'you already have a review in this project' , ar:'لديك بالفعل مراجعة في هذا المشروع'} , req.lang));

  const newReview = await ProjectReview.create({
    ...req.body,
    user:req.loggedUser.id
  });

  res.status(201).json({message:'success' , data:newReview});
};