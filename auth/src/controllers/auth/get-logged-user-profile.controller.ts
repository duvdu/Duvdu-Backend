import { UnauthenticatedError , Users } from '@duvdu-v1/duvdu';

import { GetLoggedUserProfileHandler } from '../../types/endpoints/user.endpoints';

export const getLoggedUserProfileHandler: GetLoggedUserProfileHandler = async (req, res, next) => {
  const user = await Users.findById(req.loggedUser?.id).select(
    '-googleId -appleId -password -verificationCode.code -verificationCode.expireAt -token -role',
  );
  if (!user) return next(new UnauthenticatedError(undefined , req.lang));
  const averageRate = +(
    user.rate.ratersCounter > 0 ? user.rate.totalRates / user.rate.ratersCounter : 0
  ).toFixed(2);
  res.status(200).json({ message: 'success', data: { ...(user as any)._doc, averageRate } });
};
