import 'express-async-errors';
import { NotFound, UnauthenticatedError } from '@duvdu-v1/duvdu';

import { Users } from '../../models/User.model';
import { VerifyUpdatePhoneNumberHandler } from '../../types/endpoints/user.endpoints';
import { hashVerificationCode } from '../../utils/crypto';

export const verifyUpdatePhoneNumberHandler: VerifyUpdatePhoneNumberHandler = async (
  req,
  res,
  next,
) => {
  
  const hashEnterdCode: string = hashVerificationCode(req.body.verificationCode);

  const currentUser = await Users.findOne({ 'phoneNumber.number': req.body.phoneNumber });

  if (!currentUser) 
    return next(new NotFound());
  

  const currentDate: number = new Date().getTime();

  if (
    currentDate > new Date(currentUser.verificationCode!.expireAt).getTime() ||
    currentUser.verificationCode!.code != hashEnterdCode
  ) 
    return next(new UnauthenticatedError('invalid or expired verification code'));
  

  currentUser.verificationCode = {
    code: '',
    expireAt: new Date(0).toString(),
  };

  currentUser.isBlocked = false;

  await currentUser.save();
  res.status(200).json({ message: 'success' });
};
