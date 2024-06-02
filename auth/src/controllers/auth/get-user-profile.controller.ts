import { BadRequestError, NotFound, Users } from '@duvdu-v1/duvdu';

import { GetUserProfileHandler } from '../../types/endpoints/user.endpoints';

export const getUserProfileHandler: GetUserProfileHandler = async (req, res, next) => {
  const user = await Users.findOne({username:req.params.username}).select(
    '-googleId -appleId -phoneNumber -password -verificationCode.code -verificationCode.expireAt -token -role -avaliableContracts',
  );
  if (!user) return next(new NotFound(undefined , req.lang));
  if (user.isBlocked.value === true) return next(new BadRequestError({en: 'User is blocked: ',ar: 'المستخدم محظور: '},req.lang));
  const averageRate = +(
    user.rate.ratersCounter > 0 ? user.rate.totalRates / user.rate.ratersCounter : 0
  ).toFixed(2);
  user.views++;
  await user.save();
  res.status(200).json({ message: 'success', data: { ...(user as any)._doc, averageRate } });
};
