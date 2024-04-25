import {
  dbConnection,
  PERMISSIONS,
  Plans,
  Project,
  Roles,
  Users,
  Bookmarks,
  SystemRoles,
} from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { env } from '../src/config/env';
import { hashPassword } from '../src/utils/bcrypt';

(async () => {
  await dbConnection(env.mongoDb.uri);
  await Roles.deleteMany({});
  await Users.deleteMany({});
  await Plans.deleteMany({});
  await Project.deleteMany({});
  await Bookmarks.deleteMany({});

  const [roleAdminId, roleUserId] = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
  // const projectIds = {
  //   p1: new mongoose.Types.ObjectId(),
  //   p2: new mongoose.Types.ObjectId(),
  //   p3: new mongoose.Types.ObjectId(),
  //   p4: new mongoose.Types.ObjectId(),
  //   p5: new mongoose.Types.ObjectId(),
  //   p6: new mongoose.Types.ObjectId(),
  // };

  const roles = await Roles.insertMany([
    { _id: roleAdminId, key: SystemRoles.admin },
    { _id: roleUserId, key: SystemRoles.verified, features: Object.values(PERMISSIONS) },
    { key: SystemRoles.unverified, features: [PERMISSIONS.updateProfile] },
  ]);
  // const [planAdminId, planUserId] = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
  // await Plans.insertMany([
  //   { _id: planAdminId, key: SystemRoles.admin, status: true, role: roleAdminId },
  //   { _id: planUserId, key: SystemRoles.verified, status: true, role: roleUserId },
  // ]);
  // await Projects.insertMany([
  //   { _id: projectIds.p1, title: 'project-1' },
  //   { _id: projectIds.p2, title: 'project-2' },
  //   { _id: projectIds.p3, title: 'project-3' },
  //   { _id: projectIds.p4, title: 'project-4' },
  //   { _id: projectIds.p5, title: 'project-5' },
  //   { _id: projectIds.p6, title: 'project-6' },
  // ]);
  const userId = new mongoose.Types.ObjectId().toHexString();
  await Users.insertMany([
    {
      username: 'admin',
      password: await hashPassword('123@Ewasy'),
      isVerified: true,
      role: roles[0].id,
    },
    {
      _id: userId,
      username: 'user',
      password: await hashPassword('123@Ewasy'),
      isVerified: true,
      role: roles[1].id,
    },
  ]);
  // await Bookmarks.create({
  //   user: userId,
  //   title: 'favourite',
  //   projects: [
  //     projectIds.p1,
  //     projectIds.p2,
  //     projectIds.p3,
  //     projectIds.p4,
  //     projectIds.p5,
  //     projectIds.p6,
  //   ],
  // });
  await mongoose.connection.close();
})();
