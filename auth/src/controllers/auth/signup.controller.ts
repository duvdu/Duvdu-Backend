import { NotFound, SystemRoles, Roles, Users, VerificationReason, Sessions } from '@duvdu-v1/duvdu';

import { SignupHandler } from '../../types/endpoints/user.endpoints';
import { hashPassword } from '../../utils/bcrypt';
import { hashVerificationCode } from '../../utils/crypto';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';

export const signupHandler: SignupHandler = async (req, res, next) => {
  const role = await Roles.findOne({ key: SystemRoles.unverified });

  if (!role) return next(new NotFound(undefined, req.lang));

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

  await newUser.save();

  await Sessions.create({ user: newUser.id });

  //TODO: send OTP
  res.status(201).json(<any>{ message: 'success', code: verificationCode });
};
