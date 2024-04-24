
import {  PERMISSIONS , SystemRoles , Roles, Users } from '@duvdu-v1/duvdu';

// import mongoose from 'mongoose';

// import { env } from '../src/config/env';


export const appInit = async () => {
  // await dbConnection(env.mongoDb.uri);
  let adminRole = await Roles.findOne({ key: SystemRoles.admin });
  if (!adminRole)
    adminRole = await Roles.create({ key: SystemRoles.admin, system: true, permissions: [] });
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

  if (!(await Users.findOne({role:adminRole._id}))) 
    await Users.create({username: 'metoooo', password: '@A7md123' , role:adminRole?._id , isVerified:true});
  // await mongoose.connection.close();
};
