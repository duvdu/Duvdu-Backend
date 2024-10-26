import { Categories, MODELS, UnauthenticatedError, Users } from '@duvdu-v1/duvdu';

import { updateRankForUser } from '../../services/rank.service';
import { GetLoggedUserProfileHandler } from '../../types/endpoints/user.endpoints';
import mongoose from 'mongoose';

export const getLoggedUserProfileHandler: GetLoggedUserProfileHandler = async (req, res, next) => {
  await updateRankForUser(req.loggedUser.id, req.lang);

  const user = await Users.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(req.loggedUser.id) } },
    {
      $lookup: {
        from: MODELS.category,
        localField: 'categories',
        foreignField: '_id',
        as: 'categories',
      },
    },
    {
      $project: {
        googleId: 0,
        appleId: 0,
        password: 0,
        verificationCode: 0,
        refreshTokens: 0,
        role: 0,
        favourites: 0,
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
        location: {
          lang: { $arrayElemAt: ['$location.coordinates', 0] },
          lat: { $arrayElemAt: ['$location.coordinates', 1] },
        },
      },
    },
  ]);
  if (!user[0]) return next(new UnauthenticatedError(undefined, req.lang));

  res.status(200).json({ message: 'success', data: user[0] });
};
