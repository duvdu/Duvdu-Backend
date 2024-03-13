import { dbConnection } from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { env } from '../src/config/env';
import { Roles } from '../src/models/Role.model';
import { Users } from '../src/models/User.model';
import { PERMISSIONS } from '../src/types/Permissions';

(async () => {
  await dbConnection(env.mongoDb.uri);
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
  const adminRole = await Roles.create({ key: 'admin' });
  await Roles.create(
    {
      key: 'un-verified',
      permissions: [
        PERMISSIONS.changePassword,
        PERMISSIONS.updateProfile,
        PERMISSIONS.savedProjects,
      ],
    },
    {
      key: 'verified',
      permissions: [
        PERMISSIONS.resetPassword,
        PERMISSIONS.updatePhoneNumber,
        PERMISSIONS.changePassword,
        PERMISSIONS.updateProfile,
        PERMISSIONS.savedProjects,
        PERMISSIONS.createTicket,
        PERMISSIONS.getTicket,
      ],
    },
  );

  await Users.create({ username: 'admin', isVerified: true, role: adminRole.id });
  await mongoose.disconnect();
})();
