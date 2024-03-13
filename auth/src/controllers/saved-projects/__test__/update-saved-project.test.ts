import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';
import { Plans } from '../../../models/Plan.model';
import { Projects } from '../../../models/Projects.model';
import { Roles } from '../../../models/Role.model';
import { SavedProjects } from '../../../models/Saved-Project.model';
import { Users } from '../../../models/User.model';
import { Ifeatures } from '../../../types/Permissions';
import { hashPassword } from '../../../utils/bcrypt';

const request = supertest(app);
let cookie: string, savedProjectId: string;

beforeEach(async () => {
  await Roles.create({ key: 'user', features: [Ifeatures.savedProjects] });
  await Plans.create({ key: 'plan-1', role: await Roles.findOne({ key: 'user' }) });
  const user = await Users.create({
    username: 'mohamed',
    isVerified: true,
    plan: await Plans.findOne({ key: 'plan-1' }),
    password: hashPassword('123@Ewasy'),
  });
  await Projects.insertMany([
    { title: 'project-1' },
    { title: 'project-2' },
    { title: 'project-3' },
  ]);
  savedProjectId = new mongoose.Types.ObjectId().toHexString();
  await SavedProjects.insertMany([{ _id: savedProjectId, user: user.id, title: 'favoutite' }]);
  const response = await request
    .post('/api/users/auth/signin')
    .send({ username: 'mohamed', password: '123@Ewasy' });
  cookie = response.headers['set-cookie'];
});

describe('update saved project list controller', () => {
  it('should return 200 when update a valid saved project', async () => {
    await request
      .put(`/api/users/saved-projects/${savedProjectId}`)
      .send({
        title: 'new favourite',
      })
      .set('Cookie', cookie)
      .expect(200);

    const savedProject = await SavedProjects.findOne({ title: 'new favourite' });
    expect(savedProject).toBeDefined();
  });
});
