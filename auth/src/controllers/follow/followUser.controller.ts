import 'express-async-errors';

import { BadRequestError, Follow, NotFound, Users } from '@duvdu-v1/duvdu';

import { FollowHandler } from '../../types/endpoints/follow.endpoints';



export const followHandler:FollowHandler = async (req,res,next)=>{
  const follow = await Follow.findOne({follower:req.loggedUser.id  , following:req.params.userId});

  if (follow) 
    return next(new BadRequestError(`user ${req.loggedUser.id} is already follow this user ${req.params.userId}`));
    
  const user  = await Users.findById(req.params.userId);
  if (!user) 
    return next(new NotFound('user not found'));

  const sourceUser = await Users.findById(req.loggedUser.id);
  if (!sourceUser) 
    return next(new NotFound('user not found'));

  const newFollow = await Follow.create({follower:req.loggedUser.id , following:req.params.userId});
  
  if (newFollow) {
    user.followCount.followers++;
    sourceUser.followCount.following++;
    await sourceUser.save();
    await user.save();
  }

  res.status(200).json({message:'success'});
};