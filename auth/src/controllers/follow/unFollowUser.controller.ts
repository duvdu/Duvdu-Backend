import 'express-async-errors';

import { Follow, NotFound, Users } from '@duvdu-v1/duvdu';

import { UnFollowHandler } from '../../types/endpoints/follow.endpoints';



export const unFollowHandler:UnFollowHandler = async (req,res,next)=>{
  const follow = await Follow.findOne({follower:req.loggedUser.id  , following:req.params.userId});
  if (!follow)
    return next(new NotFound({en:`user ${req.loggedUser.id} not follow this user ${req.params.userId}` , ar:`المستخدم ${req.loggedUser.id} لا يتابع هذا المستخدم ${req.params.userId}`} , req.lang));
  const user = await Users.findById(req.params.userId);
  if (!user) 
    return next(new NotFound({en:'user not found' , ar: 'المستخدم غير موجود'},req.lang));
  
  const sourceUser = await Users.findById(req.loggedUser.id);
  if (!sourceUser) 
    return next(new NotFound({en:'user not found' , ar: 'المستخدم غير موجود'},req.lang));

  const unFollow = await Follow.findOneAndDelete({follower:req.loggedUser.id  , following:req.params.userId});
  if (unFollow) {
    user.followCount.followers--;
    sourceUser.followCount.following--;
    await sourceUser.save();
    await user.save();
  }

  res.status(200).json({message:'success'});
};