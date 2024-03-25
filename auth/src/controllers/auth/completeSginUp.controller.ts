import { NotFound, UnauthorizedError , SystemRoles } from '@duvdu-v1/duvdu';

import { Roles } from '../../models/Role.model';
import { Users } from '../../models/User.model';
import { CompleteSginUpHandler } from '../../types/endpoints/user.endpoints';
import { VerificationReason } from '../../types/User';
import { hashVerificationCode } from '../../utils/crypto';
import { generateAccessToken, generateRefreshToken } from '../../utils/generateToken';
import { generateRandom6Digit } from '../../utils/gitRandom6Dugut';




export const completeSginupHandler:CompleteSginUpHandler = async (req,res,next)=>{
  const role = await Roles.findOne({key:SystemRoles.unverified});
  if (!role)return next(new NotFound('role not found'));

  const user = await Users.findById(req.loggedUser.id);
  if (!user) return next(new NotFound('user not found'));
  if (user.verificationCode?.reason != VerificationReason.completeSginUp) return next(new UnauthorizedError('user not in this cycle'));
  const verificationCode = generateRandom6Digit();
  user.name=req.body.name;
  user.username=req.body.username;
  user.phoneNumber=req.body.phoneNumber;
  user.isVerified= false;
  user.verificationCode= {
    code: hashVerificationCode(verificationCode),
    expireAt: new Date(Date.now() + 60 * 1000).toISOString(),
    reason: VerificationReason.completeSginUp,
  };

  const accessToken = generateAccessToken({
    id: user.id,
    isBlocked: { value: false },
    isVerified: false,
    role: { key: role.key, permissions: role.permissions },
  });
  const refreshToken = generateRefreshToken({ id: user.id });
  user.token = accessToken;
  await user.save();
  req.session.access = accessToken;
  req.session.refresh = refreshToken;
  //TODO: send OTP
  res.status(200).json({message:'success'});
};