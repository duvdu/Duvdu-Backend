import 'express-async-errors';
import {
  Iuser,
  NotFound,
  Rank,
  Roles,
  Setting,
  SuccessResponse,
  SystemRoles,
  UnauthenticatedError,
  Users,
  VerificationReason,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { createOrUpdateSessionAndGenerateTokens } from '../../utils/createOrUpdateSessionAndGenerateTokens';
import { hashVerificationCode } from '../../utils/crypto';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';

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
  let user;
  const providerId = req.body.appleId ? 'appleId' : 'googleId';
  const providerValue = req.body.appleId || req.body.googleId;

  // First check: Find user with matching provider ID and email
  user = await Users.findOne({
    [providerId]: providerValue,
    email: req.body.email,
  });

  // Second check: Find user with matching email and null provider ID
  if (!user && req.body.email) {
    user = await Users.findOne({
      email: req.body.email,
    });

    if (user && user[providerId])
      return next(
        new UnauthenticatedError({ en: 'invalidProvider', ar: 'الموفر غير صالح' }, req.lang),
      );
  }

  if (!user && providerId) {
    const user = await Users.findOne({
      [providerId]: providerValue,
    });

    if (user)
      return next(
        new UnauthenticatedError({ en: 'invalidProvider', ar: 'الموفر غير صالح' }, req.lang),
      );
  }

  // Handle existing user
  if (user) {
    // Update provider ID if it was null
    if (!user[providerId]) {
      user[providerId] = providerValue;
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

    const appSettings = await Setting.findOne();

    // Ensure username is unique
    const usernameExists = await Users.findOne({ username: req.body.username });
    if (usernameExists) {
      req.body.username = `${req.body.username}${Math.floor(100000 + Math.random() * 900000)}`;
    }

    user = await Users.create({
      [providerId]: providerValue,
      username: req.body.username,
      isVerified: true,
      role: role._id,
      email: req.body.email,
      name: req.body.name,
      profileImage: appSettings?.default_profile,
      coverImage: appSettings?.default_cover,
      rank: await getRankProgress(),
    });
  }

  if (!user.isVerified) {
    const verificationCode = generateRandom6Digit();

    user.verificationCode = {
      reason: VerificationReason.signup,
      code: hashVerificationCode(verificationCode),
      expireAt: new Date(Date.now() + 60 * 1000).toString(),
    };

    await user.save();

    return res
      .status(403)
      .json(<any>{ message: 'success', code: verificationCode, username: user.username });
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

export async function getRankProgress(
  stats = {
    actionCount: 0,
    projectsLiked: 0,
    projectsCount: 0,
  },
): Promise<{
  title: string | null;
  nextRankTitle: string | null;
  nextRangPercentage: number;
  color: string | null;
}> {
  // Get current rank (where all requirements match or are less than the stats)
  const currentRank = await Rank.findOne({
    actionCount: { $lte: stats.actionCount },
    projectsLiked: { $lte: stats.projectsLiked },
    projectsCount: { $lte: stats.projectsCount },
  }).sort({ actionCount: -1 }); // Get the highest matching rank

  if (!currentRank) {
    return {
      title: 'مستخدم جديد',
      nextRankTitle: 'مستخدم جديد',
      nextRangPercentage: 0,
      color: '#000000',
    };
  }

  // Get next rank (the rank with the next higher requirements)
  const nextRank = await Rank.findOne({
    actionCount: { $gt: currentRank.actionCount },
  }).sort({ actionCount: 1 }); // Get the next rank by action count

  if (!nextRank) {
    return {
      title: currentRank.rank,
      nextRankTitle: null,
      nextRangPercentage: 0,
      color: currentRank.color,
    };
  }

  // Calculate progress for each criterion
  const criteriaProgress = [
    {
      completed: stats.actionCount - currentRank.actionCount,
      needed: nextRank.actionCount - currentRank.actionCount,
    },
    {
      completed: stats.projectsLiked - currentRank.projectsLiked,
      needed: nextRank.projectsLiked - currentRank.projectsLiked,
    },
    {
      completed: stats.projectsCount - currentRank.projectsCount,
      needed: nextRank.projectsCount - currentRank.projectsCount,
    },
  ];

  // Calculate the progress percentage (highest among all criteria)
  const progress = Math.max(
    ...criteriaProgress.filter((c) => c.needed > 0).map((c) => (c.completed / c.needed) * 100),
  );

  return {
    title: currentRank.rank,
    nextRankTitle: nextRank.rank,
    nextRangPercentage: Math.min(Math.max(progress, 0), 100),
    color: currentRank.color,
  };
}
