import { UnauthenticatedError , Users } from '@duvdu-v1/duvdu';

import { ChangePasswordHandler } from '../../types/endpoints/user.endpoints';
import { comparePassword, hashPassword } from '../../utils/bcrypt';

export const changePasswordHandler: ChangePasswordHandler = async (req, res, next) => {
  const user = await Users.findById(req.loggedUser?.id);

  if (!user || !(await comparePassword(req.body.oldPassword, user.password || '')))
    return next(new UnauthenticatedError());

  user.password = await hashPassword(req.body.newPassword);
  await user.save();
  res.status(200).json({ message: 'success' });
};
