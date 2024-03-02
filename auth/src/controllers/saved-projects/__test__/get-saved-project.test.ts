import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';
import { Plans } from '../../../models/Plan.model';
import { Projects } from '../../../models/Projects.model';
import { Roles } from '../../../models/Role.model';
import { SavedProjects } from '../../../models/Saved-Project.model';
import { Users } from '../../../models/User.model';
import { Ifeatures } from '../../../types/Features';
import { hashPassword } from '../../../utils/bcrypt';

const request = supertest(app);
let cookie: string, savedProjectId: string;
const projectIds = {
  p1: new mongoose.Types.ObjectId().toHexString(),
  p2: new mongoose.Types.ObjectId().toHexString(),
  p3: new mongoose.Types.ObjectId().toHexString(),
};

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
    { _id: projectIds.p1, title: 'project-1' },
    { _id: projectIds.p2, title: 'project-2' },
    { _id: projectIds.p3, title: 'project-3' },
  ]);
  savedProjectId = new mongoose.Types.ObjectId().toHexString();
  await SavedProjects.insertMany([
    {
      _id: savedProjectId,
      user: user.id,
      title: 'favoutite',
      projects: [projectIds.p1, projectIds.p2, projectIds.p3],
    },
  ]);
  const response = await request
    .post('/api/users/signin')
    .send({ username: 'mohamed', password: '123@Ewasy' });
  console.log(response.body, response.error);
  cookie = response.headers['set-cookie'];
});

describe('get project list controller', () => {
  it('should return 200 with populated projects', async () => {
    const response = await request
      .get(`/api/users/saved-projects/${savedProjectId}`)
      .set('Cookie', cookie)
      .expect(200);

    expect(response.body.data).toBeDefined();
    expect(response.body.data?.projects.length).toBe(3);
    expect(response.body.data?.projects?.[0].title).toBeDefined();
    expect(response.body.data?.projects?.[1].title).toBeDefined();
    expect(response.body.data?.projects?.[2].title).toBeDefined();
  });
});
