import { SystemRoles, Roles, Users, permissions, Setting } from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { hashPassword } from './../src/utils/bcrypt';

// import { env } from '../src/config/env';

export const appInit = async () => {
  // await dbConnection(env.mongoDb.uri);

  // drop database
  // if (mongoose.connection.db) {
  //   await mongoose.connection.db.dropDatabase();
  // }

  let adminRole = await Roles.findOne({ key: SystemRoles.admin });
  if (!adminRole)
    adminRole = await Roles.create({
      key: SystemRoles.admin,
      system: true,
      permissions: permissions.all,
    });
  else await Roles.findOneAndUpdate({ key: SystemRoles.admin }, { permissions: permissions.all });

  if (!(await Roles.findOne({ key: SystemRoles.verified })))
    await Roles.create({
      key: SystemRoles.verified,
      system: true,
      permissions: [],
    });
  else
    await Roles.findOneAndUpdate(
      { key: SystemRoles.verified },
      {
        permissions: [],
        system: true,
      },
    );

  if (!(await Roles.findOne({ key: SystemRoles.unverified })))
    await Roles.create({
      key: SystemRoles.unverified,
      system: true,
      permissions: [],
    });
  else
    await Roles.findOneAndUpdate(
      { key: SystemRoles.unverified },
      {
        permissions: [],
        system: true,
      },
    );

  if (!(await Users.findOne({ username: 'duvduSuperAdmin' })))
    await Users.create({
      username: 'duvduSuperAdmin',
      name: 'Duvdu Super Admin',
      password: await hashPassword('123@Password'),
      role: adminRole?._id,
      isVerified: true,
    });
  else
    await Users.findOneAndUpdate(
      { username: 'duvduSuperAdmin' },
      { name: 'Duvdu Super Admin', password: await hashPassword('123@Password') },
    );

  if (!(await Setting.findOne())) await Setting.create({});

  // await mongoose.connection.close();
};
