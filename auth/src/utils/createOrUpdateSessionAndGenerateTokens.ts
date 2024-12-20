import { generateAccessToken, Irole, Iuser, userSession } from '@duvdu-v1/duvdu';
import { Document } from 'mongoose';

import { generateRefreshToken } from './generateToken';
import { generateUniqueDeviceId } from './generateUniqueDeviceId';

export const createOrUpdateSessionAndGenerateTokens = async (
  headers: any,
  user: Iuser & Document,
  role: Irole,
  fcmToken: string | null,
): Promise<{ refreshToken: string; accessToken: string }> => {
  const {deviceId} = generateUniqueDeviceId(headers);

  // Ensure user.refreshTokens and fcmTokens are initialized
  if (!user.refreshTokens) {
    user.refreshTokens = [];
  }
  if (!user.fcmTokens) {
    user.fcmTokens = [];
  }
  console.log(role);

  // Generate tokens
  const refreshToken = generateRefreshToken({ id: user.id.toString() });
  const accessToken = generateAccessToken({
    id: user.id,
    isVerified: user.isVerified,
    isBlocked: user.isBlocked,
    role: { key: role.key, permissions: role.permissions },
  });

  // Create or update the session in the database
  const sessionData = { user: user.id, refreshToken, deviceId };
  await userSession.findOneAndUpdate({ user: user.id, deviceId }, sessionData, { upsert: true });
  // Update or add the new refresh token
  const tokenIndex = user.refreshTokens.findIndex((rt) => rt.deviceId === deviceId);
  if (tokenIndex !== -1) {
    // Fix: use strict comparison
    user.refreshTokens[tokenIndex] = { token: refreshToken, deviceId };
  } else {
    user.refreshTokens.push({ token: refreshToken, deviceId });
  }

  // Handle FCM token
  if (fcmToken) {
    const existFcmIndex = user.fcmTokens.findIndex((el) => el.deviceId === deviceId);
    if (existFcmIndex !== -1) {
      // Fix: use strict comparison
      user.fcmTokens[existFcmIndex] = { fcmToken: fcmToken, deviceId };
    } else {
      user.fcmTokens.push({ fcmToken: fcmToken, deviceId });
    }
  }

  await user.save();
  return { refreshToken, accessToken };
};
