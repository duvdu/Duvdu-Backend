import { UnauthenticatedError, Users } from '@duvdu-v1/duvdu';

import { updateRankForUser } from '../../services/rank.service';
import { GetLoggedUserProfileHandler } from '../../types/endpoints/user.endpoints';

export const getLoggedUserProfileHandler: GetLoggedUserProfileHandler = async (req, res, next) => {
  await updateRankForUser(req.loggedUser.id, req.lang);
  
  const user = await Users.findById(req.loggedUser?.id)
    .select(
      '-googleId -appleId -password -verificationCode.code -verificationCode.expireAt -refreshTokens -role -favourites',
    )
    .populate({ path: 'category', select: 'title' })
    .lean();
  if (!user) return next(new UnauthenticatedError(undefined, req.lang));

  (user as any).averageRate = +(
    user.rate.ratersCounter > 0 ? user.rate.totalRates / user.rate.ratersCounter : 0
  ).toFixed(2);
  if (user.coverImage) user.coverImage = process.env.BUCKET_HOST + '/' + user.coverImage;
  if (user.profileImage) user.profileImage = process.env.BUCKET_HOST + '/' + user.profileImage;
  if (user.category) (user.category as any).title = (user.category as any).title[req.lang];
  res.status(200).json({ message: 'success', data: user });
};
