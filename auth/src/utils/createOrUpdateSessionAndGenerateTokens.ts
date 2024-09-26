import { generateAccessToken, Irole, Iuser, userSession } from '@duvdu-v1/duvdu';
import { Document } from 'mongoose';

import { generateRefreshToken } from './generateToken';
import { generateUniqueDeviceId } from './generateUniqueDeviceId';

export const createOrUpdateSessionAndGenerateTokens = async (
  userAgent: string,
  user: Iuser & Document,
  role: Irole,
  notificationToken: string | null
): Promise<{ refreshToken: string; accessToken: string }> => {
  const deviceId = generateUniqueDeviceId(userAgent!);
  
  // Generate tokens
  const refreshToken = generateRefreshToken({ id: user._id.toString() });
  const accessToken = generateAccessToken({
    id: user.id,
    isVerified: user.isVerified,
    isBlocked: user.isBlocked,
    role: { key: role.key, permissions: role.permissions },
  });
  
  // Create or update the session in the database
  const sessionData = { user: user._id, refreshToken, deviceId };
  await userSession.findOneAndUpdate({ user: user._id, deviceId }, sessionData, { upsert: true });
  
  // Update or add the new refresh token to the user
  const tokenIndex = user.refreshTokens?.findIndex((rt) => rt.deviceId === deviceId);
  if (tokenIndex !== -1 && tokenIndex !== undefined) {
      user.refreshTokens![tokenIndex] = { token: refreshToken, deviceId };
  } else {
    user.refreshTokens = user.refreshTokens || []; 
    user.refreshTokens.push({ token: refreshToken, deviceId });
  }
  
  user.notificationToken = notificationToken ? notificationToken : null;
  await user.save();
  
  return { refreshToken, accessToken };
};
  