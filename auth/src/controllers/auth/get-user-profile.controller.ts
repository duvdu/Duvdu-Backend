import 'express-async-errors';

import { NotFound } from '@duvdu-v1/duvdu';

import { Users } from '../../models/User.model';
import { GetUserProfileHandler } from '../../types/endpoints/user.endpoints';

export const getUserProfileHandler: GetUserProfileHandler = async (req, res, next) => {
  const user = await Users.findById(req.params.userId).select(
    'id name phoneNumber username profileImage coverImage location category acceptedProjectsCounter profileViews about isOnline isAvaliableToInstantProjects pricePerHour hasVerificationPadge',
  );
  if (!user) return next(new NotFound());
  const averageRate = +(
    user.rate.ratersCounter > 0 ? user.rate.totalRates / user.rate.ratersCounter : 0
  ).toFixed(2);
  res.status(200).json({ message: 'success', data: { ...user, averageRate } });
};
