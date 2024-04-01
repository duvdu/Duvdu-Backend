import { dbConnection, SystemRoles } from '@duvdu-v1/duvdu';
import { config } from 'dotenv';
import mongoose from 'mongoose';

import { Plans } from '@duvdu-v1/duvdu';
import { Roles } from '@duvdu-v1/duvdu';
import { PERMISSIONS } from '@duvdu-v1/duvdu';
import { env } from '../src/config/env';

config();

(async () => {
  // free plan
  await dbConnection(env.mongoDb.uri);
  let role = await Roles.findOne({ key: 'not verified' });
  if (!role)
    role = await Roles.create({
      key: SystemRoles.unverified,
      system: true,
      features: [PERMISSIONS.updateProfile],
    });

  const verifiedRole = await Roles.findOne({ key: SystemRoles.verified });
  if (!verifiedRole) await Roles.create({ key: SystemRoles.verified, system: true });

  // const plan = await Plans.findOne({ role: role?.id });
  // if (!plan) {
  //   await Plans.create({ role: role?.id, key: SystemRoles. });
  // }
  // admin plan
  let adminRole = await Roles.findOne({ key: SystemRoles.admin });
  if (!adminRole) {
    adminRole = await Roles.create({ key: SystemRoles.admin, system: true });
  }

  await mongoose.connection.close();
})();
