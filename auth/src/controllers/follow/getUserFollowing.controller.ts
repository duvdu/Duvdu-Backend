import 'express-async-errors';

import { Follow } from '@duvdu-v1/duvdu';

import { GetFollowingHandler } from '../../types/endpoints/follow.endpoints';


export const getFollowingHandler:GetFollowingHandler = async (req,res)=>{
  const following = await Follow.find({follower:req.loggedUser.id})
    .select('following')
    .skip(req.pagination.skip)
    .limit(req.pagination.limit)
    .populate([
      {path:'following' , select:'rate profileImage username name'},
    ]);

  const resultCount = await Follow.countDocuments({follower:req.loggedUser.id});

  res.status(200).json({
    message:'success',
    pagination:{
      currentPage:req.pagination.page,
      resultCount,
      totalPages:Math.ceil(resultCount/req.pagination.limit)
    },
    data:following
  });
};