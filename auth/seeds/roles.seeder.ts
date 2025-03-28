import { PERMISSIONS, SystemRoles, Roles, Users } from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { hashPassword } from './../src/utils/bcrypt';

// import { env } from '../src/config/env';

export const appInit = async () => {
  // await dbConnection(env.mongoDb.uri);
  let adminRole = await Roles.findOne({ key: SystemRoles.admin });
  if (!adminRole)
    adminRole = await Roles.create({ key: SystemRoles.admin, system: true, permissions: [] });
  if (!(await Roles.findOne({ key: SystemRoles.verified })))
    await Roles.create({
      _id: new mongoose.Types.ObjectId('662b930f4566c8d2f8ed6ae4'),
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
  else
    await Roles.findOneAndUpdate(
      { key: SystemRoles.verified },
      {
        permissions: [
          PERMISSIONS.bookmarks,
          PERMISSIONS.changePassword,
          PERMISSIONS.resetPassword,
          PERMISSIONS.updatePhoneNumber,
          PERMISSIONS.updateProfile,
          PERMISSIONS.createCopyrightHandler,
          PERMISSIONS.createProjectHandler,
          PERMISSIONS.createProjectHandler,
          PERMISSIONS.updateProjectHandler,
          PERMISSIONS.removeProjectHandler,
          PERMISSIONS.updateProjectHandler,
          PERMISSIONS.updateCopyrightHandler,
          PERMISSIONS.createTicket,
          PERMISSIONS.createTeamProjectHandler,
          PERMISSIONS.updateTeamProjectCreativeHandler,
          PERMISSIONS.updateTeamProjectHandler,
          PERMISSIONS.deleteTeamProjectCreativeHandler,
          PERMISSIONS.deleteTeamProjectHandler,
          PERMISSIONS.booking,
        ],
      },
    );

  if (!(await Roles.findOne({ key: SystemRoles.unverified })))
    await Roles.create({
      _id: new mongoose.Types.ObjectId('665313e6fd70dd6d63d23481'),
      key: SystemRoles.unverified,
      system: true,
      permissions: [PERMISSIONS.changePassword, PERMISSIONS.updateProfile],
    });

  if (!(await Users.findOne({ username: 'metoooooo' })))
    await Users.create({
      username: 'metoooooo',
      password: await hashPassword('123@Password'),
      role: adminRole?._id,
      isVerified: true,
      category: '65e6ea22517343b4041334dc',
    });
  // await mongoose.connection.close();
};
