import 'express-async-errors';

import { Users, userSession } from '@duvdu-v1/duvdu';

import { LogoutHandler } from '../../types/endpoints/user.endpoints';
import { generateUniqueDeviceId } from '../../utils/generateUniqueDeviceId';

export const logoutHandler: LogoutHandler = async (req, res) => {
  const { deviceId } = generateUniqueDeviceId(req.headers);
  await userSession.deleteOne({
    user: req.loggedUser.id,
    refreshToken: req.session.refresh,
    deviceId,
  });

  await Users.findByIdAndUpdate(
    { _id: req.loggedUser.id },
    { $pull: { refreshTokens: { token: req.session.refresh }, fcmTokens: { deviceId } } },
  );

  // 2. Clear current session
  await new Promise<void>((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) reject(err);
      resolve();
    });
  });

  // Clear cookies if you're using them
  res.clearCookie('access');
  res.clearCookie('refresh');
  res.clearCookie('connect.sid');

  res.status(200).json({ message: 'success' });
};
