import { BadRequestError, NotFound } from '@duvdu-v1/duvdu';

import { Users } from '../../models/User.model';
import { GetUserProfileHandler } from '../../types/endpoints/user.endpoints';

export const getUserProfileHandler: GetUserProfileHandler = async (req, res, next) => {
  const user = await Users.findById(req.params.userId).select(
    '-googleId -appleId -phoneNumber -password -verificationCode.code -verificationCode.expireAt -token -role -avaliableContracts',
  );
  if (!user) return next(new NotFound());
  if (user.isBlocked) return next(new BadRequestError('user is blocked'));
  const averageRate = +(
    user.rate.ratersCounter > 0 ? user.rate.totalRates / user.rate.ratersCounter : 0
  ).toFixed(2);
  res.status(200).json({ message: 'success', data: { ...(user as any)._doc, averageRate } });
};
