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
  // Refactored username validation and generation
  if (req.body.username) {
    let username = req.body.username.replace(/\s/g, '').toLowerCase();
    
    // Ensure minimum length and generate unique username if needed
    while (username.length < 7) {
      const randomChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
      const randomNumber = Math.floor(Math.random() * 10);
      username += randomChar + randomNumber;
    }

    req.body.username = username;
  } else {
    // Generate username from email if no username provided
    const emailPrefix = req.body.email?.split('@')[0] || '';
    let username = emailPrefix.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    // Add random chars if username is too short
    while (username.length < 7) {
      const randomChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
      const randomNumber = Math.floor(Math.random() * 10);
      username += randomChar + randomNumber;
    }

    req.body.username = username;
  }

  let role;
  let user = await Users.findOne({
    $or: [
      ...(req.body.appleId ? [{ appleId: { $eq: req.body.appleId, $ne: null } }] : []),
      ...(req.body.googleId ? [{ googleId: { $eq: req.body.googleId, $ne: null } }] : []),
      { email: {$eq: req.body.email }},
    ],
  });

  // Handle existing user
  if (user) {
    // Update provider IDs if they're new
    if (req.body.googleId && !user.googleId) {
      user.googleId = req.body.googleId;
    }
    if (req.body.appleId && !user.appleId) {
      user.appleId = req.body.appleId;
    }
    
    // Update email if not present
    if (req.body.email && !user.email) {
      user.email = req.body.email;
    }

    // Update name if not present
    if (req.body.name && !user.name) {
      user.name = req.body.name;
    }

    role = await Roles.findById(user.role);
    if (!role) {
      return next(
        new UnauthenticatedError(
          { en: 'User role not found', ar: 'دور المستخدم غير موجود' },
          req.lang,
        ),
      );
    }
  } else {
    // Create new user
    role = await Roles.findOne({ key: SystemRoles.verified });
    if (!role) return next(new NotFound(undefined, req.lang));

    // Ensure username is unique
    const usernameExists = await Users.findOne({ username: req.body.username });
    if (usernameExists) {
      req.body.username = `${req.body.username}${Math.floor(100000 + Math.random() * 900000)}`;
    }

    user = await Users.create({
      appleId: req.body.appleId,
      googleId: req.body.googleId,
      username: req.body.username,
      isVerified: true,
      role: role._id,
      email: req.body.email,
      name: req.body.name,
    });
  }

  if (!user.isVerified) {
    return next(
      new BadRequestError(
        {
          en: `Account not verified reason : ${user.verificationCode?.reason}`,
          ar: `سبب عدم توثيق الحساب : ${user.verificationCode?.reason}`,
        },
        req.lang,
      ),
    );
  }

  const { accessToken, refreshToken } = await createOrUpdateSessionAndGenerateTokens(
    req.headers,
    user,
    role,
    req.body.notificationToken || null,
  );

  req.session.access = accessToken;
  req.session.refresh = refreshToken;
  await user.save();

  return res.status(200).json({ message: 'success' });
};
