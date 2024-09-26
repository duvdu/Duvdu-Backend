import 'express-async-errors';

import { Users, userSession } from '@duvdu-v1/duvdu';

import { LogoutHandler } from '../../types/endpoints/user.endpoints';
import { generateUniqueDeviceId } from '../../utils/generateUniqueDeviceId';

export const logoutHandler: LogoutHandler = async (req, res) => {
  const userAgent = req.headers['user-agent'];

  const deviceId = generateUniqueDeviceId(userAgent!);
  await userSession.deleteOne({
    user: req.loggedUser.id,
    refreshToken: req.session.refresh,
    deviceId,
  });

  await Users.findByIdAndUpdate(
    { _id: req.loggedUser.id },
    { $pull: { refreshTokens: { token: req.session.refresh } } },
  );


  req.session.access = '';
  req.session.refresh = '';

  res.status(200).json({ message: 'success' });
};
