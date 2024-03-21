import { dbConnection } from '@duvdu-v1/duvdu';
import { config } from 'dotenv';
import mongoose from 'mongoose';

import { Plans } from '../models/Plan.model';
import { Roles } from '../models/Role.model';
import { Ifeatures } from '../../auth/src/types/Features';
import { env } from '../config/env';

config();

(async () => {
  // free plan
  await dbConnection(env.mongoDb.uri);
  let role = await Roles.findOne({ key: 'not verified' });
  if (!role)
    role = await Roles.create({
      key: 'not verified',
      system: true,
      features: [Ifeatures.updateProfile],
    });

  const verifiedRole = await Roles.findOne({ key: 'verified' });
  if (!verifiedRole) await Roles.create({ key: 'verified', system: true });

  const plan = await Plans.findOne({ role: role?.id });
  if (!plan) {
    await Plans.create({ role: role?.id, key: 'free' });
  }
  // admin plan
  let adminRole = await Roles.findOne({ key: 'admin' });
  if (!adminRole) {
    adminRole = await Roles.create({ key: 'admin', system: true });
  }

  await mongoose.connection.close();
})();
