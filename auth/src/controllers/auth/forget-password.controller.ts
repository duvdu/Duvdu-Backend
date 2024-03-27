import { BadRequestError, NotFound, UnauthorizedError, Users , Irole , SuccessResponse , VerificationReason } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { hashPassword } from '../../utils/bcrypt';
import { hashVerificationCode } from '../../utils/crypto';
import { generateAccessToken, generateRefreshToken } from '../../utils/generateToken';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';

export const askForgetPasswordHandler: RequestHandler<
  { username: string },
  SuccessResponse
> = async (req, res, next) => {
  const user = await Users.findOne({ username: req.params.username });
  if (!user) return next(new NotFound());

  if (!user.isVerified) return next(new BadRequestError('account not verified'));
  if (user.isBlocked.value)
    return next(new BadRequestError(`user is blocked:${user.isBlocked.reason}`));

  const code = generateRandom6Digit();
  user.verificationCode = {
    code: hashVerificationCode(code),
    expireAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    reason: VerificationReason.forgetPassword,
  };
  await user.save();
  // TODO: send OTP
  res.status(200).json(<any>{ message: 'success', code });
};

export const updateForgetenPasswordHandler: RequestHandler<
  { username: string },
  SuccessResponse,
  {
    newPassword: string;
  }
> = async (req, res, next) => {
  const user = await Users.findOne({ username: req.params.username }).populate('role');
  if (!user) return next(new NotFound());

  if (!user.isBlocked) return next(new UnauthorizedError('user is blocked'));
  if (!user.isVerified) return next(new BadRequestError('account not verified'));

  if (user.verificationCode?.reason !== VerificationReason.forgetPasswordVerified)
    return next(new UnauthorizedError());

  const role = <Irole>user.role;

  const accessToken = generateAccessToken({
    id: user.id,
    isVerified: user.isVerified,
    isBlocked: user.isBlocked,
    role: { key: role.key, permissions: role.permissions },
  });
  const refreshToken = generateRefreshToken({ id: user.id });

  user.password = await hashPassword(req.body.newPassword);
  user.token = refreshToken;

  await user.save();
  req.session.access = accessToken;
  req.session.refresh = refreshToken;

  res.status(200).json({ message: 'success' });
};

