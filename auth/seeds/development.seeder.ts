import { dbConnection } from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { SavedProjects } from './../src/models/Saved-Project.model';
import { env } from '../config/env';
import { Plans } from '../models/Plan.model';
import { Projects } from '../models/Projects.model';
import { Roles } from '../models/Role.model';
import { Users } from '../models/User.model';
import { Ifeatures } from '../types/Permissions';
import { hashPassword } from '../utils/bcrypt';

(async () => {
  await dbConnection(env.mongoDb.uri);
  await Roles.deleteMany({});
  await Users.deleteMany({});
  await Plans.deleteMany({});
  await Projects.deleteMany({});
  await SavedProjects.deleteMany({});

  const [roleAdminId, roleUserId] = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
  const projectIds = {
    p1: new mongoose.Types.ObjectId(),
    p2: new mongoose.Types.ObjectId(),
    p3: new mongoose.Types.ObjectId(),
    p4: new mongoose.Types.ObjectId(),
    p5: new mongoose.Types.ObjectId(),
    p6: new mongoose.Types.ObjectId(),
  };

  await Roles.insertMany([
    { _id: roleAdminId, key: 'admin' },
    { _id: roleUserId, key: 'user', features: Object.values(Ifeatures) },
  ]);
  const [planAdminId, planUserId] = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
  await Plans.insertMany([
    { _id: planAdminId, key: 'admin', status: true, role: roleAdminId },
    { _id: planUserId, key: 'user', status: true, role: roleUserId },
  ]);
  await Projects.insertMany([
    { _id: projectIds.p1, title: 'project-1' },
    { _id: projectIds.p2, title: 'project-2' },
    { _id: projectIds.p3, title: 'project-3' },
    { _id: projectIds.p4, title: 'project-4' },
    { _id: projectIds.p5, title: 'project-5' },
    { _id: projectIds.p6, title: 'project-6' },
  ]);
  const userId = new mongoose.Types.ObjectId().toHexString();
  await Users.insertMany([
    {
      username: 'admin',
      password: await hashPassword('123@Ewasy'),
      isVerified: true,
      plan: planAdminId,
    },
    {
      _id: userId,
      username: 'user',
      password: await hashPassword('123@Ewasy'),
      isVerified: true,
      plan: planUserId,
    },
  ]);
  await SavedProjects.create({
    user: userId,
    title: 'favourite',
    projects: [
      projectIds.p1,
      projectIds.p2,
      projectIds.p3,
      projectIds.p4,
      projectIds.p5,
      projectIds.p6,
    ],
  });
  await mongoose.connection.close();
})();
