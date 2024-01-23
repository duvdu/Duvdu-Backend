import 'express-async-errors';

import { NotFound ,UnauthenticatedError } from '@duvdu-v1/duvdu';

import { Users } from '../../models/User.model';
import { verifyUpdatePhoneNumberHandler } from '../../types/endpoints';
import { hashVerificationCode } from '../../utils/crypto';

export const verifyUpdatePhoneNumber:verifyUpdatePhoneNumberHandler = async (req,res,next)=>{
  const hashEnterdCode:string = hashVerificationCode(req.body.verificationCode);

  const currentUser = await Users.findById(req.user?.id);

  if (!currentUser) {
    return next(new NotFound());
  }

  const currentDate:number = new Date().getTime();

  if (currentUser.verificationCode?.expireAt && currentDate > currentUser.verificationCode.expireAt && currentUser.verificationCode.code != hashEnterdCode) {
    return next(new UnauthenticatedError('invalid or expired verification code'));
  }

  currentUser.verificationCode = {
    code:'',
    expireAt:0
  };
  res.status(200).json({message:'success'});
};