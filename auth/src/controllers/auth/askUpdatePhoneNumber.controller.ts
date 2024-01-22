import 'express-async-errors';
import { UnauthenticatedError } from '@duvdu-v1/duvdu';

import { Users } from '../../models/User.model';
import { AskUpdatePhoneNumberHandler } from '../../types/endpoints';
import { comparePassword } from '../../utils/bcrypt';
import { hashVerificationCode } from '../../utils/crypto';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';


export const askUpdateUserNameHandler:AskUpdatePhoneNumberHandler=async(req , res , next)=>{
  const user = await Users.findById(req.user?.id);

  if (!user || !comparePassword(req.body.password! , user.password || '')) {
    return next(new UnauthenticatedError());
  }

  const randomCode = generateRandom6Digit();
  const hashedRandomCode = hashVerificationCode(randomCode);
  user.verificationCode = {
    code:hashedRandomCode,
    expireAt: Date.now() + 10 * 60 * 1000 ,
  };

  res.status(200).json({ message: 'success' });
};