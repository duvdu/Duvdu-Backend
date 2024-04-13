import { dbConnection , PERMISSIONS , Roles , Users} from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { env } from '.././src/config/env';

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
      ],
    },
    {
      key: 'verified',
      permissions: [
        PERMISSIONS.resetPassword,
        PERMISSIONS.updatePhoneNumber,
        PERMISSIONS.changePassword,
        PERMISSIONS.updateProfile,
        PERMISSIONS.createTicket,
        PERMISSIONS.getTicket,
      ],
    },
  );

  await Users.create({ username: 'admin', isVerified: true, role: adminRole.id });
  await mongoose.disconnect();
})();
