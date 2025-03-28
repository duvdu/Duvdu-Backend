import {
  UnauthenticatedError,
  Roles,
  Users,
  VerificationReason,
  BadRequestError,
} from '@duvdu-v1/duvdu';

import { SigninHandler } from '../../types/endpoints/user.endpoints';
import { comparePassword } from '../../utils/bcrypt';
import { createOrUpdateSessionAndGenerateTokens } from '../../utils/createOrUpdateSessionAndGenerateTokens';
import { hashVerificationCode } from '../../utils/crypto';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';

export const signinHandler: SigninHandler = async (req, res, next) => {
  const { login, password, notificationToken } = req.body;

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

  const user = await Users.findOne(query);

  if (!user || !(await comparePassword(password, user.password || '')))
    return next(
      new UnauthenticatedError(
        { en: 'Invalid username or password', ar: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        req.lang,
      ),
    );

  if (!user.isVerified && (user.verificationCode!.reason = VerificationReason.signup)) {
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

  const role = await Roles.findById(user.role);
  if (!role)
    return next(
      new UnauthenticatedError(
        { en: 'User role not found', ar: 'دور المستخدم غير موجود' },
        req.lang,
      ),
    );

  const { accessToken, refreshToken } = await createOrUpdateSessionAndGenerateTokens(
    req.headers,
    user,
    role,
    notificationToken ? notificationToken : null,
  );

  req.session.access = accessToken;
  req.session.refresh = refreshToken;

  res.status(200).json({ message: 'success' });
};
