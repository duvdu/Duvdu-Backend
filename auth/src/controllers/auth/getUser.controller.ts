import 'express-async-errors';

import { NotFound, Users } from '@duvdu-v1/duvdu';

import { GetUserHandler } from '../../types/endpoints/user.endpoints';

export const getUserHandler:GetUserHandler = async (req,res,next)=>{
  const user = await Users.findOne({username:req.params.username}).select(
    '-googleId -appleId -phoneNumber -password -verificationCode.code -verificationCode.expireAt -token -role -avaliableContracts',
  );  if (!user)
    return next(new NotFound(undefined , req.lang));

  res.status(200).json({message:'success' , data:user});
};