import { dbConnection } from '@duvdu-v1/duvdu';
import { config } from 'dotenv';
import mongoose from 'mongoose';

import { Plans } from './../src/models/Plan.model';
import { Roles } from './../src/models/Role.model';
import { env } from '../src/config/env';

config();

(async () => {
  // free plan
  await dbConnection(env.mongoDb.uri);
  let role = await Roles.findOne({ key: 'free' });
  if (!role) {
    role = await Roles.create({ key: 'free' });
  }
  const plan = await Plans.findOne({ role: role?.id });
  if (!plan) {
    await Plans.create({ role: role?.id, key: 'free' });
  }
  // admin plan
  let adminRole = await Roles.findOne({ key: 'admin' });
  if (!adminRole) {
    adminRole = await Roles.create({ key: 'admin' });
  }
  const adminPlan = await Plans.findOne({ role: adminRole?.id });
  if (!adminPlan) {
    await Plans.create({ role: adminRole?.id, key: 'admin' });
  }
  await mongoose.connection.close();
})();
