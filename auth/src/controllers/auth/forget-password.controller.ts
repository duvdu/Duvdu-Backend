import {
  BadRequestError,
  NotFound,
  UnauthorizedError,
  Users,
  Irole,
  SuccessResponse,
  VerificationReason,
  userSession,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { hashPassword } from '../../utils/bcrypt';
import { hashVerificationCode } from '../../utils/crypto';
import { generateBrowserFingerprint } from '../../utils/generateFingerPrint';
import { generateAccessToken, generateRefreshToken } from '../../utils/generateToken';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';

export const askForgetPasswordHandler: RequestHandler<
  { username: string },
  SuccessResponse
> = async (req, res, next) => {
  const user = await Users.findOne({ username: req.params.username });
  if (!user) return next(new NotFound(undefined, req.lang));

  if (!user.isVerified)
    return next(
      new BadRequestError({ en: 'account not verified', ar: 'الحساب غير موثق' }, req.lang),
    );
  if (user.isBlocked.value)
    return next(
      new BadRequestError(
        {
          en: `user is blocked:${user.isBlocked.reason}`,
          ar: `المستخدم محظور:${user.isBlocked.reason}`,
        },
        req.lang,
      ),
    );

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

  if (!user.isBlocked)
    return next(
      new UnauthorizedError({ en: 'User is blocked: ', ar: 'المستخدم محظور: ' }, req.lang),
    );
  if (!user.isVerified)
    return next(
      new BadRequestError({ en: 'account not verified', ar: 'الحساب غير موثق' }, req.lang),
    );

  if (user.verificationCode?.reason !== VerificationReason.forgetPasswordVerified)
    return next(new UnauthorizedError(undefined, req.lang));

  const role = <Irole>user.role;

  const fingerprint = await generateBrowserFingerprint();
  const userAgent = req.headers['user-agent'];
  const clientType = userAgent && /mobile|android|touch|webos/i.test(userAgent) ? 'mobile' : 'web';
  const refreshToken = generateRefreshToken({ id: user._id.toString() });
  const accessToken = generateAccessToken({
    id: user.id,
    isVerified: user.isVerified,
    isBlocked: user.isBlocked,
    role: { key: role.key, permissions: role.permissions },
  });

  // Update or replace existing session and token
  const sessionData = {
    user: user._id,
    fingerPrint: fingerprint,
    clientType,
    refreshToken,
    userAgent,
  };
  await userSession.findOneAndUpdate(
    { user: user._id, fingerPrint: fingerprint, clientType, userAgent },
    sessionData,
    { upsert: true },
  );

  // Update or add the new refresh token
  const tokenIndex = user.refreshTokens?.findIndex(
    (rt) => rt.clientType === clientType && rt.fingerprint === fingerprint,
  );
  if (tokenIndex !== -1) {
    user.refreshTokens![tokenIndex!] = {
      token: refreshToken,
      clientType,
      fingerprint: fingerprint,
      userAgent: userAgent!,
    };
  } else {
    user.refreshTokens?.push({
      token: refreshToken,
      clientType,
      fingerprint: fingerprint,
      userAgent: userAgent!,
    });
  }

  user.password = await hashPassword(req.body.newPassword);
  await user.save();

  req.session.access = accessToken;
  req.session.refresh = refreshToken;

  res.status(200).json({ message: 'success' });
};
