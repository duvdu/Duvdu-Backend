import { BadRequestError, Follow, Icategory, NotFound, Users } from '@duvdu-v1/duvdu';

import { GetUserProfileHandler } from '../../types/endpoints/user.endpoints';

export const getUserProfileHandler: GetUserProfileHandler = async (req, res, next) => {
  const user = await Users.findOne({ username: req.params.username })
    .select(
      '-googleId -appleId -phoneNumber -password -verificationCode.code -verificationCode.expireAt -token -role -avaliableContracts -favourites',
    )
    .populate({ path: 'category', select: 'title' });
  if (!user) return next(new NotFound(undefined, req.lang));
  if (user.isBlocked.value === true)
    return next(new BadRequestError({ en: 'User is blocked: ', ar: 'المستخدم محظور: ' }, req.lang));
  const averageRate = +(
    user.rate.ratersCounter > 0 ? user.rate.totalRates / user.rate.ratersCounter : 0
  ).toFixed(2);
  user.profileViews++;
  await user.save();
  if (user.coverImage)
    (user as any)._doc.coverImage = process.env.BUCKET_HOST + '/' + user.coverImage;
  if (user.profileImage)
    (user as any)._doc.profileImage = process.env.BUCKET_HOST + '/' + user.profileImage;
  if ((user.category as Icategory)?.title)
    (user as any)._doc.category = {
      title:
        req.lang === 'en'
          ? (user.category as Icategory).title.en
          : (user.category as Icategory).title.ar,
    };

  // isFollow
  const isFollow = await Follow.findOne({ follower: req.loggedUser?.id, following: user.id });

  res.status(200).json({
    message: 'success',
    data: { ...(user as any)._doc, averageRate, isFollow: !!isFollow },
  });
};
