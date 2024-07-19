import { UnauthenticatedError, Users } from '@duvdu-v1/duvdu';

import { GetLoggedUserProfileHandler } from '../../types/endpoints/user.endpoints';

export const getLoggedUserProfileHandler: GetLoggedUserProfileHandler = async (req, res, next) => {
  
  const user = await Users.findById(req.loggedUser?.id)
    .select(
      '-googleId -appleId -password -verificationCode.code -verificationCode.expireAt -token -role -favourites',
    ).populate({path:'category' , select:'title'})
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
