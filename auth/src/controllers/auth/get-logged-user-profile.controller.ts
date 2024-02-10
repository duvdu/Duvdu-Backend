import 'express-async-errors';
import { UnauthenticatedError } from '@duvdu-v1/duvdu';

import { Users } from '../../models/User.model';
import { GetLoggedUserProfileHandler } from '../../types/endpoints/user.endpoints';

export const getLoggedUserProfileHandler: GetLoggedUserProfileHandler = async (req, res, next) => {
  const user = await Users.findById(req.loggedUser?.id).select(
    'id name phoneNumber username profileImage coverImage location category acceptedProjectsCounter profileViews about isOnline isAvaliableToInstantProjects pricePerHour plan hasVerificationPadge avaliableContracts',
  );
  if (!user) return next(new UnauthenticatedError());
  const averageRate = +(
    user.rate.ratersCounter > 0 ? user.rate.totalRates / user.rate.ratersCounter : 0
  ).toFixed(2);
  res.status(200).json({ message: 'success', data: { ...user, averageRate } });
};
