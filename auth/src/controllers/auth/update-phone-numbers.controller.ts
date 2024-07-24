import { NotFound, UnauthenticatedError, UnauthorizedError, Users, SuccessResponse, VerificationReason } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { AskUpdatePhoneNumberHandler } from '../../types/endpoints/user.endpoints';
import { hashVerificationCode } from '../../utils/crypto';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';

export const askUpdatePhoneNumberHandler: AskUpdatePhoneNumberHandler = async (req, res, next) => {
  const currentUser = await Users.findById(req.loggedUser?.id);
  if (!currentUser)
    return next(new UnauthenticatedError(undefined , req.lang));

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
  { phoneNumber: string }
> = async (req, res, next) => {
  const currentUser = await Users.findById(req.loggedUser?.id);
  if (!currentUser) return next(new NotFound(undefined , req.lang));
  if (currentUser.verificationCode?.reason !== VerificationReason.updateOldPhoneNumberVerified)
    return next(new UnauthorizedError(undefined , req.lang));

  const verificationCode: string = generateRandom6Digit();
  const hashedVerificationCode: string = hashVerificationCode(verificationCode);

  currentUser.phoneNumber.number = req.body.phoneNumber;

  currentUser.verificationCode = {
    reason: VerificationReason.updateNewPhoneNumber,
    code: hashedVerificationCode,
    expireAt: new Date(Date.now() + 60 * 1000).toString(),
  };
  currentUser.isVerified = false;
  const tokenIndex = currentUser.refreshTokens?.findIndex(rt => rt.token === req.session.refresh);

  if (tokenIndex !== -1) 
    currentUser.refreshTokens?.splice(tokenIndex! , 1);

  await currentUser.save();

  req.session.destroy((err) => {
    if (err) 
      throw new Error('Error destroying session');
  });
  //TODO: send OTP

  res.status(200).json(<any>{ message: 'success', code: verificationCode });
};
