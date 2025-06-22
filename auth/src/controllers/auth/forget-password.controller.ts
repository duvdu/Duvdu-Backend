import 'express-async-errors';
import {
  BadRequestError,
  NotFound,
  UnauthorizedError,
  Users,
  Irole,
  SuccessResponse,
  VerificationReason,
  SystemRoles,
  UnauthenticatedError,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { createOrUpdateSessionAndGenerateTokens } from './../../utils/createOrUpdateSessionAndGenerateTokens';
import { hashPassword } from '../../utils/bcrypt';
import { hashVerificationCode } from '../../utils/crypto';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';

export const askForgetPasswordHandler: RequestHandler<
  unknown,
  SuccessResponse,
  { login: string },
  unknown
> = async (req, res, next) => {
  const { login } = req.body;

  const query: { username?: string; email?: string; 'phoneNumber.number'?: string } = {};
  let sendEmailOtp = false;

  if (login) {
    if (login.includes('@')) {
      query.email = login;
      sendEmailOtp = true;
    } else if (/^\d+$/.test(login)) {
      query['phoneNumber.number'] = login;
    } else {
      query.username = login;
    }
  }

  if (Object.keys(query).length === 0)
    return next(
      new BadRequestError(
        {
          en: 'Please provide either username, email, or phone number',
          ar: 'يرجى تقديم اسم المستخدم أو البريد الإلكتروني أو رقم الهاتف',
        },
        req.lang,
      ),
    );

  const user = await Users.findOne(query).populate('role');
  if (!user) return next(new NotFound(undefined, req.lang));



  const origin = req.headers?.origin;
  const isDashboard = origin?.includes('dashboard.duvdu.com');
  const isMobileApp = req.headers['x-app-version'] || req.headers['x-platform'];
  const userAgent = req.headers['user-agent'] || '';
  const isPostman = userAgent.includes('Postman');

  if (!isPostman) {
    if (isDashboard) {
      if ([SystemRoles.unverified, SystemRoles.verified].includes((user.role as Irole).key as SystemRoles)) {
        return next(
          new UnauthenticatedError(
            { en: 'User not authorized', ar: 'المستخدم غير مصرح له' },
            req.lang,
          ),
        );
      }
    } else if (isMobileApp) {
      if (![SystemRoles.unverified, SystemRoles.verified].includes((user.role as Irole).key as SystemRoles)) {
        return next(
          new UnauthenticatedError(
            { en: 'User not authorized for mobile app', ar: 'المستخدم غير مصرح له للتطبيق' },
            req.lang,
          ),
        );
      }
    } else {
      if (![SystemRoles.unverified, SystemRoles.verified].includes((user.role as Irole).key as SystemRoles)) {
        return next(
          new UnauthenticatedError(
            { en: 'User not authorized', ar: 'المستخدم غير مصرح له' },
            req.lang,
          ),
        );
      }
    }
  }


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
  // TODO: send OTP to email or phone
  if (sendEmailOtp) {
    console.log('send otp to email');
  } else {
    console.log('send otp to phone');
  }

  res.status(200).json(<any>{ message: 'success', code });
};

export const updateForgetenPasswordHandler: RequestHandler<
  unknown,
  SuccessResponse,
  { login: string; newPassword: string },
  unknown
> = async (req, res, next) => {
  const { login } = req.body;

  const query: { username?: string; email?: string; 'phoneNumber.number'?: string } = {};

  if (login) {
    if (login.includes('@')) {
      query.email = login;
    } else if (/^\d+$/.test(login)) {
      query['phoneNumber.number'] = login;
    } else {
      query.username = login;
    }
  }

  if (Object.keys(query).length === 0)
    return next(
      new BadRequestError(
        {
          en: 'Please provide either username, email, or phone number',
          ar: 'يرجى تقديم اسم المستخدم أو البريد الإلكتروني أو رقم الهاتف',
        },
        req.lang,
      ),
    );

  const user = await Users.findOne(query).populate('role');
  if (!user) return next(new NotFound());

  if (!user.isBlocked)
    return next(
      new UnauthorizedError({ en: 'User is blocked: ', ar: 'المستخدم محظور: ' }, req.lang),
    );

  if (user.verificationCode?.reason !== VerificationReason.forgetPasswordVerified)
    return next(new UnauthorizedError(undefined, req.lang));

  const role = <Irole>user.role;

  const { accessToken, refreshToken } = await createOrUpdateSessionAndGenerateTokens(
    req.headers,
    user,
    role,
    null,
  );

  user.password = await hashPassword(req.body.newPassword);
  await user.save();

  req.session.access = accessToken;
  req.session.refresh = refreshToken;

  res.status(200).json({ message: 'success' });
};
