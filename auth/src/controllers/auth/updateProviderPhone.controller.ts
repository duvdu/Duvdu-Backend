import 'express-async-errors';

import {
  BadRequestError,
  NotFound,
  SuccessResponse,
  Users,
  VerificationReason,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { smsService } from '../../services/sms.service';
import { hashVerificationCode } from '../../utils/crypto';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';

export const updateProviderPhoneNumberHandler: RequestHandler<
  unknown,
  SuccessResponse,
  { phoneNumber: string }
> = async (req, res, next) => {
  const currentUser = await Users.findById(req.loggedUser?.id);
  if (!currentUser) return next(new NotFound(undefined, req.lang));

  const user = await Users.findOne({
    'phoneNumber.number': req.body.phoneNumber,
    haveInvitation: false,
  });
  if (user)
    return next(
      new BadRequestError(
        { en: 'phone number already exist', ar: 'رقم الهاتف موجود بالفعل' },
        req.lang,
      ),
    );

  // handle invitedUser
  const invitedUser = await Users.findOne({
    'phoneNumber.number': req.body.phoneNumber,
    haveInvitation: true,
  });

  if (invitedUser) {
    await Users.findByIdAndDelete(invitedUser._id);
    currentUser._id = invitedUser._id;
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
  const tokenIndex = currentUser.refreshTokens?.findIndex((rt) => rt.token === req.session.refresh);

  if (tokenIndex !== -1) currentUser.refreshTokens?.splice(tokenIndex!, 1);

  await currentUser.save();

  req.session.destroy((err) => {
    if (err) throw new Error('Error destroying session');
  });
  await smsService.sendOtp(currentUser.phoneNumber.number, verificationCode);

  res.status(200).json(<any>{ message: 'success' });
};
