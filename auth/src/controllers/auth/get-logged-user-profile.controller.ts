import { MODELS, UnauthenticatedError, Users } from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { GetLoggedUserProfileHandler } from '../../types/endpoints/user.endpoints';

export const getLoggedUserProfileHandler: GetLoggedUserProfileHandler = async (req, res, next) => {
  const user = await Users.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(req.loggedUser.id) } },
    //roles
    {
      $lookup: {
        from: MODELS.role,
        localField: 'role',
        foreignField: '_id',
        as: 'role',
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
      $project: {
        googleId: 0,
        appleId: 0,
        password: 0,
        verificationCode: 0,
        refreshTokens: 0,
        favourites: 0,
      },
    },
    {
      $addFields: {
        role: { $arrayElemAt: ['$role', 0] },
        averageRate: {
          $cond: {
            if: { $gt: ['$rate.ratersCounter', 0] },
            then: { $round: [{ $divide: ['$rate.totalRates', '$rate.ratersCounter'] }, 2] },
            else: 0,
          },
        },
        coverImage: { $concat: [process.env.BUCKET_HOST, '/', '$coverImage'] },
        profileImage: { $concat: [process.env.BUCKET_HOST, '/', '$profileImage'] },
        faceRecognition: { $concat: [process.env.BUCKET_HOST, '/', '$faceRecognition'] },
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
          lng: { $arrayElemAt: ['$location.coordinates', 0] },
          lat: { $arrayElemAt: ['$location.coordinates', 1] },
        },
      },
    },
  ]);
  if (!user[0]) return next(new UnauthenticatedError(undefined, req.lang));

  res.status(200).json({ message: 'success', data: user[0] });
};
