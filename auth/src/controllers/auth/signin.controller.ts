import { UnauthenticatedError, Roles, Users, VerificationReason, BadRequestError, userSession } from '@duvdu-v1/duvdu';

import { SigninHandler } from '../../types/endpoints/user.endpoints';
import { comparePassword } from '../../utils/bcrypt';
import { generateBrowserFingerprint } from '../../utils/generateFingerPrint';
import { generateAccessToken, generateRefreshToken } from '../../utils/generateToken';

export const signinHandler: SigninHandler = async (req, res, next) => {
  
  const user = await Users.findOne({ username: req.body.username });

  if (!user || !(await comparePassword(req.body.password, user.password || '')))
    return next(new UnauthenticatedError({ar:'خطا ف  الاسم او كلمة المرور ' , en:'invalid username or password'} , req.lang));

  if (!user.isVerified && (user.verificationCode!.reason = VerificationReason.signup)) 
    return next(new BadRequestError({en:`Account not verified reason : ${VerificationReason.signup}` , ar:`سبب عدم توثيق الحساب : ${VerificationReason.signup}`} , req.lang));

  const role = await Roles.findById(user.role);
  if (!role) return next(new UnauthenticatedError({en:'user dont have a role' , ar: 'المستخدم ليس لديه دور'} , req.lang));
  
  const fingerprint = await generateBrowserFingerprint();
  const userAgent = req.headers['user-agent'];
  let clientType = 'web';

  if (userAgent && /mobile|android|touch|webos/i.test(userAgent))
    clientType = 'mobile';

  const existingSession = await userSession.findOne({ user: user._id, fingerPrint: fingerprint, clientType }).exec();

  if (existingSession) {
    req.session.access = existingSession.accessToken;
    req.session.refresh = existingSession.refreshToken;
  } else {
    const accessToken = generateAccessToken({
      id: user.id,
      isVerified: user.isVerified,
      isBlocked: user.isBlocked,
      role: { key: role.key, permissions: role.permissions },
    });
    const refreshToken = generateRefreshToken({ id: user.id });

    await userSession.create({
      user: user._id,
      fingerPrint: fingerprint,
      accessToken,
      refreshToken,
      clientType,
    });

    req.session.access = accessToken;
    req.session.refresh = refreshToken;
  }

  res.status(200).json({ message: 'success' });
};
