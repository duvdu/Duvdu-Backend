import 'express-async-errors';

import { Follow } from '@duvdu-v1/duvdu';

import { GetFollowersHandler } from '../../types/endpoints/follow.endpoints';



export const getFollowersHandler:GetFollowersHandler = async (req,res)=>{
  const followers = await Follow.find({following:req.loggedUser.id})
    .select('follower')
    .skip(req.pagination.skip)
    .limit(req.pagination.limit)
    .populate([
      {path:'follower' , select:'rate profileImage username name'}
    ]);

  const resultCount = await Follow.countDocuments({following:req.loggedUser.id});
  res.status(200).json({
    message:'success',
    pagination:{
      currentPage:req.pagination.page,
      resultCount,
      totalPages:Math.ceil(resultCount/req.pagination.limit)
    },
    data:followers
  });
};