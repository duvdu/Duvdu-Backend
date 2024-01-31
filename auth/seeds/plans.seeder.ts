import { dbConnection } from '@duvdu-v1/duvdu';
import { config } from 'dotenv';
import mongoose from 'mongoose';

import { Plans } from './../src/models/Plan.model';
import { Roles } from './../src/models/Role.model';
import { env } from '../src/config/env';

config();

(async () => {
  await dbConnection(env.mongoDb.uri);
  let role = await Roles.findOne({ key: 'free' });
  if (!role) {
    role = await Roles.create({ key: 'free' });
  }
  const plan = await Plans.findOne({ role: role?.id });
  if (!plan) {
    await Plans.create({ role: role?.id, key: 'free' });
  }
  await mongoose.connection.close();
})();
