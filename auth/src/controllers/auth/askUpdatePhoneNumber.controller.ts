import 'express-async-errors';
import { UnauthenticatedError } from '@duvdu-v1/duvdu';

import { Users } from '../../models/User.model';
import { AskUpdatePhoneNumberHandler } from '../../types/endpoints';
import { comparePassword } from '../../utils/bcrypt';
import { hashVerificationCode } from '../../utils/crypto';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';

export const askUpdateUserPhoneHandler: AskUpdatePhoneNumberHandler = async (req, res, next) => {
  
  const currentUser = await Users.findById((req as any).user?.id);

  if (!currentUser || !comparePassword(req.body.password!, currentUser.password || '')) {
    return next(new UnauthenticatedError());
  }

  const randomCode = generateRandom6Digit();
  const hashedRandomCode = hashVerificationCode(randomCode);
  
  currentUser.verificationCode = {
    code: hashedRandomCode,
    expireAt: Date.now() + 10 * 60 * 1000,
  };
  await currentUser.save();

  // send otp to user

  res.status(200).json({ message: 'success' });
};
