import { BadRequestError, NotFound, UnauthorizedError , SystemRoles , Roles , Users , SuccessResponse , VerificationReason} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { hashVerificationCode } from '../../utils/crypto';

export const verifyHandler: RequestHandler<
  unknown,
  SuccessResponse<{ reason: string; username: string }>,
  { username: string; code: string }
> = async (req, res, next) => {
  const user = await Users.findOne({ username: req.body.username });
  if (!user) return next(new NotFound({en:'User not found' , ar: 'المستخدم غير موجود'} , req.lang));
  if (!user.verificationCode?.code) return next(new UnauthorizedError(undefined , req.lang));
  const currentTime = Date.now();
  const expireTime = new Date(user.verificationCode.expireAt || '0').getTime();
  if (currentTime > expireTime) return next(new BadRequestError({en:'token expired' , ar:'انتهت صلاحية الرمز'} , req.lang));
  if (user.verificationCode.code !== hashVerificationCode(req.body.code))
    return next(new BadRequestError({en:'invalid code' , ar:'الرمز غير صالح'} , req.lang));

  user.verificationCode.code = undefined;
  user.verificationCode.expireAt = undefined;
  if (user.verificationCode.reason === VerificationReason.forgetPassword)
    user.verificationCode.reason = VerificationReason.forgetPasswordVerified;
  else if (user.verificationCode.reason === VerificationReason.updateOldPhoneNumber)
    user.verificationCode.reason = VerificationReason.updateOldPhoneNumberVerified;
  else if (user.verificationCode.reason === VerificationReason.completeSginUp)
    user.verificationCode.reason = VerificationReason.CompleteSginUpVerfied;
  else {
    user.isVerified = true;
    user.verificationCode.reason = undefined;
    const role = await Roles.findOne({ key: SystemRoles.verified });
    
    user.role = role?.id;
  }

  await user.save();
  res.status(200).json({
    message: 'success',
    reason: user.verificationCode.reason as string,
    username: req.body.username,
  });
};
