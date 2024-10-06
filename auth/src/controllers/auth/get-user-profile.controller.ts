import {
  BadRequestError,
  Contracts,
  Follow,
  Icategory,
  MODELS,
  NotFound,
  Users,
} from '@duvdu-v1/duvdu';

import { GetUserProfileHandler } from '../../types/endpoints/user.endpoints';

export const getUserProfileHandler: GetUserProfileHandler = async (req, res, next) => {
  const user = await Users.aggregate([
    { $match: { username: req.params.username } },
    {
      $project: {
        googleId: 0,
        appleId: 0,
        phoneNumber: 0,
        password: 0,
        'verificationCode.code': 0,
        'verificationCode.expireAt': 0,
        refreshTokens: 0,
        role: 0,
        avaliableContracts: 0,
      },
    },
    {
      $lookup: {
        from: MODELS.category,
        localField: 'categories',
        foreignField: '_id',
        as: 'categories',
      },
    },
    {
      $addFields: {
        averageRate: {
          $cond: {
            if: { $gt: ['$rate.ratersCounter', 0] },
            then: { $round: [{ $divide: ['$rate.totalRates', '$rate.ratersCounter'] }, 2] },
            else: 0,
          },
        },
        coverImage: { $concat: [process.env.BUCKET_HOST, '/', '$coverImage'] },
        profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$profileImage'] },
        categories: {
          $map: {
            input: '$categories',
            as: 'category',
            in: {
              _id: '$$category._id',
              title: {
                $cond: {
                  if: { $eq: [req.lang, 'ar'] },
                  then: '$$category.title.ar',
                  else: '$$category.title.en',
                },
              },
            },
          },
        },
      },
    },
  ]);
  if (!user[0]) return next(new NotFound(undefined, req.lang));
  if (user[0].isBlocked.value === true)
    return next(new BadRequestError({ en: 'User is blocked: ', ar: 'المستخدم محظور: ' }, req.lang));
  user[0].profileViews++;
  await Users.updateOne({ _id: user[0]._id }, { profileViews: user[0].profileViews });

  // isFollow
  const isFollow = await Follow.findOne({ follower: req.loggedUser?.id, following: user[0].id });
  const canChat = await Contracts.findOne({
    $or: [
      { sp: req.loggedUser?.id, customer: user[0]._id },
      { customer: req.loggedUser?.id, sp: user[0]._id },
    ],
  });
  res.status(200).json({
    message: 'success',
    data: { ...user[0], isFollow: !!isFollow, canChat: !!canChat },
  });
};
