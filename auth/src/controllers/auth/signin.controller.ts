import { UnauthenticatedError, Roles, Users, VerificationReason, BadRequestError, userSession } from '@duvdu-v1/duvdu';

import { SigninHandler } from '../../types/endpoints/user.endpoints';
import { comparePassword } from '../../utils/bcrypt';
import { generateBrowserFingerprint } from '../../utils/generateFingerPrint';
import { generateAccessToken, generateRefreshToken } from '../../utils/generateToken';

export const signinHandler: SigninHandler = async (req, res, next) => {
  const { username, password, notificationToken } = req.body;
  const user = await Users.findOne({ username });
  if (!user || !(await comparePassword(password, user.password || ''))) 
    return next(new UnauthenticatedError({ en: 'Invalid username or password', ar: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, req.lang));
  

  if (!user.isVerified && (user.verificationCode!.reason = VerificationReason.signup)) 
    return next(new BadRequestError({en:`Account not verified reason : ${VerificationReason.signup}` , ar:`سبب عدم توثيق الحساب : ${VerificationReason.signup}`} , req.lang));

  const role = await Roles.findById(user.role);
  if (!role) 
    return next(new UnauthenticatedError({ en: 'User role not found', ar: 'دور المستخدم غير موجود' }, req.lang));
    

  const fingerprint = await generateBrowserFingerprint();
  const userAgent = req.headers['user-agent'];
  const clientType = userAgent && /mobile|android|touch|webos/i.test(userAgent) ? 'mobile' : 'web';    
  const refreshToken = generateRefreshToken({id:user._id.toString()});
  const accessToken = generateAccessToken({
    id: user.id,
    isVerified: user.isVerified,
    isBlocked: user.isBlocked,
    role: { key: role.key, permissions: role.permissions },
  });

  // Update or replace existing session and token
  const sessionData = { user: user._id, fingerPrint: fingerprint, clientType, refreshToken , userAgent};
  await userSession.findOneAndUpdate({ user: user._id, fingerPrint: fingerprint, clientType  , userAgent}, sessionData, { upsert: true });

  // Update or add the new refresh token
  const tokenIndex = user.refreshTokens?.findIndex(rt => rt.clientType === clientType && rt.fingerprint === fingerprint && rt.userAgent === userAgent );
  if (tokenIndex !== -1) {
      user.refreshTokens![tokenIndex!] = { token: refreshToken, clientType, fingerprint: fingerprint , userAgent:userAgent! };
  } else {
    user.refreshTokens?.push({ token: refreshToken, clientType, fingerprint: fingerprint , userAgent:userAgent! });
  }
  user.notificationToken = notificationToken ? notificationToken : null;
  await user.save();

  req.session.access = accessToken;
  req.session.refresh = refreshToken;

  res.status(200).json({ message:'success'});
};
