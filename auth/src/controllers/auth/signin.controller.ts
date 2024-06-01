import { UnauthenticatedError, Roles, Users, VerificationReason, BadRequestError } from '@duvdu-v1/duvdu';

import { SigninHandler } from '../../types/endpoints/user.endpoints';
import { comparePassword } from '../../utils/bcrypt';
import { generateAccessToken, generateRefreshToken } from '../../utils/generateToken';

export const signinHandler: SigninHandler = async (req, res, next) => {
  
  const user = await Users.findOne({ username: req.body.username });

  if (!user || !(await comparePassword(req.body.password, user.password || '')))
    return next(new UnauthenticatedError(undefined , req.lang));

  if (!user.isVerified && (user.verificationCode!.reason = VerificationReason.signup)) 
    return next(new BadRequestError({en:`Account not verified reason : ${VerificationReason.signup}` , ar:`سبب عدم توثيق الحساب : ${VerificationReason.signup}`} , req.lang));

  const role = await Roles.findById(user.role);
  if (!role) return next(new UnauthenticatedError({en:'user dont have a role' , ar: 'المستخدم ليس لديه دور'} , req.lang));
  
  const accessToken = generateAccessToken({
    id: user.id,
    isVerified: user.isVerified,
    isBlocked: user.isBlocked,
    role: { key: role.key, permissions: role.permissions },
  });
  const refreshToken = generateRefreshToken({ id: user.id });

  req.session.access = accessToken;
  req.session.refresh = refreshToken;
  user.token = refreshToken;
  user.notificationToken = req.body.notificationToken?req.body.notificationToken:null;

  await user.save();
  res.status(200).json({ message: 'success' });
};
