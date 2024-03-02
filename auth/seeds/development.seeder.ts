import { dbConnection } from '@duvdu-v1/duvdu';
import mongoose from 'mongoose';

import { Projects } from './../src/models/Projects.model';
import { SavedProjects } from './../src/models/Saved-Project.model';
import { Users } from './../src/models/User.model';
import { Ifeatures } from './../src/types/Features';
import { hashPassword } from './../src/utils/bcrypt';
import { env } from '../src/config/env';
import { Plans } from '../src/models/Plan.model';
import { Roles } from '../src/models/Role.model';

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
    { _id: roleUserId, key: 'user', features: [Ifeatures.savedProjects, Ifeatures.updateProfile] },
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
    { username: 'admin', password: hashPassword('123@Ewasy'), isVerified: true, plan: planAdminId },
    {
      _id: userId,
      username: 'user',
      password: hashPassword('123@Ewasy'),
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
