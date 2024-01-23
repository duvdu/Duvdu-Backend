import 'express-async-errors';
import { NotFound , UnauthenticatedError } from '@duvdu-v1/duvdu';

import { Users } from '../../models/User.model';
import { UpdatePhoneNumberHandler } from '../../types/endpoints';
import { hashVerificationCode } from '../../utils/crypto';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';


export const updatePhoneNumberHandler:UpdatePhoneNumberHandler = async (req,res , next)=>{

  const hashEnterdCode = hashVerificationCode(req.body.verificationCode);
  const currentUser = await Users.findById(req.user?.id);

  if (!currentUser) {
    return next(new NotFound());
  }

  const currentDate:number = new Date().getTime();

  if (currentUser.verificationCode?.expireAt && currentDate > currentUser.verificationCode.expireAt && currentUser.verificationCode.code != hashEnterdCode) {
    return next(new UnauthenticatedError('invalid or expired verification code'));
  }

  const verificationCode:string = generateRandom6Digit();
  const hashedVerificationCode:string = hashVerificationCode(verificationCode);

  currentUser.phoneNumber.number = req.body.phoneNumber;
  currentUser.verificationCode = {
    code: hashedVerificationCode,
    expireAt: Date.now() + 10 * 60 * 1000 ,
  };
  currentUser.isVerified = false;
  await currentUser.save();

  // send otp to user

  res.status(200).json({message:'success'});
};