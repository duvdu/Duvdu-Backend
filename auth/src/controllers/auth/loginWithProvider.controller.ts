import 'express-async-errors';
import {
  BadRequestError,
  Iuser,
  NotFound,
  Roles,
  SuccessResponse,
  SystemRoles,
  UnauthenticatedError,
  Users,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { createOrUpdateSessionAndGenerateTokens } from '../../utils/createOrUpdateSessionAndGenerateTokens';

export const loginWithProviderHandler: RequestHandler<
  unknown,
  SuccessResponse,
  Partial<
    Pick<Iuser, 'googleId' | 'appleId' | 'username' | 'name' | 'email'> & {
      notificationToken?: string;
    }
  >,
  unknown
> = async (req, res, next) => {
  if (req.body.username!.length < 6 || /\s/.test(req.body.username!)) {
    let username = req.body.username!.replace(/\s/g, '').toLowerCase();

    if (username.length <= 6) {
      const randomChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
      const randomNumber = Math.floor(Math.random() * 10);

      username = `${username}${randomChar}${randomNumber}`;

      if (username.length <= 6) {
        username = username.padEnd(7, randomChar);
      }
    }

    req.body.username = username.toLowerCase();
  }

  let role;
  let user = await Users.findOne({
    $or: [{ appleId: req.body.appleId, googleId: req.body.googleId, email: req.body.email }],
  });

  if (!user) {
    user = await Users.findOne({ username: req.body.username });
    if (user) {
      req.body.username = `${req.body.username}${Math.floor(100000 + Math.random() * 900000)}`;
    }

    role = await Roles.findOne({ key: SystemRoles.verified });
    if (!role) return next(new NotFound(undefined, req.lang));

    user = await Users.create({
      appleId: req.body.appleId,
      googleId: req.body.googleId,
      username: req.body.username,
      isVerified: true,
      role: role._id,
      email: req.body.email,
      name: req.body.name,
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

  // update user with new provider id
  if (req.body.googleId) user.googleId = req.body.googleId;
  if (req.body.appleId) user.appleId = req.body.appleId;

  const { accessToken, refreshToken } = await createOrUpdateSessionAndGenerateTokens(
    req.headers,
    user,
    role,
    req.body.notificationToken ? req.body.notificationToken : null,
  );

  req.session.access = accessToken;
  req.session.refresh = refreshToken;

  return res.status(200).json({ message: 'success' });
};
