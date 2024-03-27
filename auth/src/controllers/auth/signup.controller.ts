import { NotFound , SystemRoles, Roles, Users ,VerificationReason } from '@duvdu-v1/duvdu';

import { SignupHandler } from '../../types/endpoints/user.endpoints';
import { hashPassword } from '../../utils/bcrypt';
import { hashVerificationCode } from '../../utils/crypto';
import { generateAccessToken, generateRefreshToken } from '../../utils/generateToken';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';

export const signupHandler: SignupHandler = async (req, res, next) => {
  const role = await Roles.findOne({ key: SystemRoles.unverified });
  if (!role) return next(new NotFound('role not found'));

  const verificationCode = generateRandom6Digit();
  const newUser = await Users.create({
    ...req.body,
    password: await hashPassword(req.body.password),
    role: role.id,
    isVerified: false,
    verificationCode: {
      code: hashVerificationCode(verificationCode),
      expireAt: new Date(Date.now() + 60 * 1000),
      reason: VerificationReason.signup,
    },
  });

  const accessToken = generateAccessToken({
    id: newUser.id,
    isBlocked: { value: false },
    isVerified: false,
    role: { key: role.key, permissions: role.permissions },
  });
  const refreshToken = generateRefreshToken({ id: newUser.id });
  newUser.token = accessToken;
  await newUser.save();
  req.session.access = accessToken;
  req.session.refresh = refreshToken;

  //TODO: send OTP
  res.status(201).json(<any>{ message: 'success', code: verificationCode });
};
