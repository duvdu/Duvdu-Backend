import { SystemRoles, Roles, Users } from '@duvdu-v1/duvdu';
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
      permissions: []
    });
  else
    await Roles.findOneAndUpdate(
      { key: SystemRoles.verified },
      {
        permissions: []
      },
    );

  if (!(await Roles.findOne({ key: SystemRoles.unverified })))
    await Roles.create({
      _id: new mongoose.Types.ObjectId('665313e6fd70dd6d63d23481'),
      key: SystemRoles.unverified,
      system: true,
      permissions: [],
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
