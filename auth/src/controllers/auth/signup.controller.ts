import { NotFound, SystemRoles, Roles, Users, VerificationReason, Sessions } from '@duvdu-v1/duvdu';

import { SignupHandler } from '../../types/endpoints/user.endpoints';
import { hashPassword } from '../../utils/bcrypt';
import { hashVerificationCode } from '../../utils/crypto';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';

export const signupHandler: SignupHandler = async (req, res, next) => {
  const role = await Roles.findOne({ key: SystemRoles.unverified });

  if (!role) return next(new NotFound(undefined, req.lang));
  const verificationCode = generateRandom6Digit();

  // handle invention users
  let newUser = await Users.findOne({
    'phoneNumber.number': req.body.phoneNumber.number,
    haveInvitation: true,
  });

  if (!newUser) {
    newUser = await Users.create({
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
  } else {
    await Users.findByIdAndUpdate(
      newUser._id,
      {
        ...req.body,
        password: await hashPassword(req.body.password),
        role: role.id,
        isVerified: false,
        haveInvitation: false,
        verificationCode: {
          code: hashVerificationCode(verificationCode),
          expireAt: new Date(Date.now() + 60 * 1000),
          reason: VerificationReason.signup,
        },
      },
      { new: true },
    );
  }

  await newUser.save();

  await Sessions.create({ user: newUser.id });

  //TODO: send OTP
  res.status(201).json(<any>{ message: 'success', code: verificationCode });
};
