import { NotFound, UnauthenticatedError, UnauthorizedError } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { Users } from '../../models/User.model';
import { AskUpdatePhoneNumberHandler } from '../../types/endpoints/user.endpoints';
import { SuccessResponse } from '../../types/success-response';
import { VerificationReason } from '../../types/User';
import { comparePassword } from '../../utils/bcrypt';
import { hashVerificationCode } from '../../utils/crypto';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';

export const askUpdatePhoneNumberHandler: AskUpdatePhoneNumberHandler = async (req, res, next) => {
  const currentUser = await Users.findById(req.loggedUser?.id);
  if (!currentUser || !comparePassword(req.body.password!, currentUser.password || ''))
    return next(new UnauthenticatedError());

  const randomCode = generateRandom6Digit();
  const hashedRandomCode = hashVerificationCode(randomCode);

  currentUser.verificationCode = {
    code: hashedRandomCode,
    expireAt: new Date(Date.now() + 60 * 1000).toString(),
    reason: VerificationReason.updateOldPhoneNumber,
  };
  await currentUser.save();

  //TODO: send OTP
  res.status(200).json(<any>{ message: 'success', code: randomCode });
};

export const updatePhoneNumberHandler: RequestHandler<
  unknown,
  SuccessResponse,
  { verificationCode: string; phoneNumber: string }
> = async (req, res, next) => {
  const currentUser = await Users.findById(req.loggedUser?.id);
  if (!currentUser) return next(new NotFound());
  if (currentUser.verificationCode?.reason === VerificationReason.updateOldPhoneNumberVerified)
    return next(new UnauthorizedError());

  const hashEnterdCode = hashVerificationCode(req.body.verificationCode);
  if (currentUser.phoneNumber.number) {
    const currentDate: number = new Date().getTime();

    if (
      currentDate > new Date(currentUser.verificationCode?.expireAt || 0).getTime() ||
      currentUser.verificationCode!.code != hashEnterdCode
    )
      return next(new UnauthenticatedError());
  }

  const verificationCode: string = generateRandom6Digit();
  const hashedVerificationCode: string = hashVerificationCode(verificationCode);

  currentUser.phoneNumber.number = req.body.phoneNumber;

  currentUser.verificationCode = {
    reason: VerificationReason.updateNewPhoneNumber,
    code: hashedVerificationCode,
    expireAt: new Date(Date.now() + 60 * 1000).toString(),
  };
  currentUser.isVerified = false;
  currentUser.token = undefined;
  await currentUser.save();

  //TODO: send OTP

  res.status(200).json(<any>{ message: 'success', code: verificationCode });
};
