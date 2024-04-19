
import {  PERMISSIONS , SystemRoles , Roles } from '@duvdu-v1/duvdu';

// import mongoose from 'mongoose';

// import { env } from '../src/config/env';

export const appInit = async () => {
  // await dbConnection(env.mongoDb.uri);
  if (!(await Roles.findOne({ key: SystemRoles.admin })))
    await Roles.create({ key: SystemRoles.admin, system: true, permissions: [] });
  if (!(await Roles.findOne({ key: SystemRoles.verified })))
    await Roles.create({
      key: SystemRoles.verified,
      system: true,
      permissions: [
        PERMISSIONS.bookmarks,
        PERMISSIONS.changePassword,
        PERMISSIONS.resetPassword,
        PERMISSIONS.updatePhoneNumber,
        PERMISSIONS.updateProfile,
      ],
    });
  if (!(await Roles.findOne({ key: SystemRoles.unverified })))
    await Roles.create({
      key: SystemRoles.unverified,
      system: true,
      permissions: [PERMISSIONS.changePassword, PERMISSIONS.updateProfile],
    });
    
  // await mongoose.connection.close();
};
