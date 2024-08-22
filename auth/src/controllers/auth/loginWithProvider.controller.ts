import {
  BadRequestError,
  generateAccessToken,
  Iuser,
  NotFound,
  Roles,
  SuccessResponse,
  SystemRoles,
  UnauthenticatedError,
  Users,
  userSession,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import 'express-async-errors';
import { generateBrowserFingerprint } from '../../utils/generateFingerPrint';
import { generateRefreshToken } from '../../utils/generateToken';

export const loginWithProviderHandler: RequestHandler<
  unknown,
  SuccessResponse,
  Partial<Pick<Iuser, 'googleId' | 'appleId' | 'username' | 'notificationToken'>>,
  unknown
> = async (req, res, next) => {
  if (req.body.username!.length < 6) {
    let username = req.body.username!.toLowerCase();
      
    if (username.length <= 6) {
      const randomChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
      const randomNumber = Math.floor(Math.random() * 10);
      
      username = `${username}${randomChar}${randomNumber}`;
      
      if (username.length <= 6) {
        username = username.padEnd(7, randomChar);
      }
    }
    req.body.username = username.toLowerCase();
    console.log(req.body.username);
    
  }

  let role;
  let user = await Users.findOne({
    $or: [{ appleId: req.body.appleId, googleId: req.body.googleId }],
  });

  if (!user) {
    user = await Users.findOne({ username: req.body.username });
    if (user) {
      req.body.username = `${req.body.username}${Math.floor(100000 + Math.random() * 900000)}`;
    }

    role = await Roles.findOne({ key: SystemRoles.unverified });
    if (!role) return next(new NotFound(undefined, req.lang));

    user = await Users.create({
      appleId: req.body.appleId,
      googleId: req.body.googleId,
      username: req.body.username,
      isVerified: true,
      role: role._id,
    });
  } else {
    role = await Roles.findById(user.role);
    if (!role) {
      return next(
        new UnauthenticatedError(
          { en: 'User role not found', ar: 'دور المستخدم غير موجود' },
          req.lang,
        ),
      );
    }
  }

  if (!user.isVerified)
    return next(
      new BadRequestError(
        {
          en: `Account not verified reason : ${user.verificationCode?.reason}`,
          ar: `سبب عدم توثيق الحساب : ${user.verificationCode?.reason}`,
        },
        req.lang,
      ),
    );

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
    (rt) =>
      rt.clientType === clientType && rt.fingerprint === fingerprint && rt.userAgent === userAgent,
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

  user.notificationToken = req.body.notificationToken ? req.body.notificationToken : null;
  await user.save();

  req.session.access = accessToken;
  req.session.refresh = refreshToken;

  return res.status(200).json({ message: 'success' });
};
