import supertest from 'supertest';

import { app } from '../../../app';
import { SavedProjects } from '../../../models/Bookmark.model';
import { Plans } from '../../../models/Plan.model';
import { Projects } from '../../../models/Projects.model';
import { Roles } from '../../../models/Role.model';
import { Users } from '../../../models/User.model';
import { Ifeatures } from '../../../types/Permissions';
import { hashPassword } from '../../../utils/bcrypt';

const request = supertest(app);
let cookie: string;

beforeEach(async () => {
  await Roles.create({ key: 'user', features: [Ifeatures.savedProjects] });
  await Plans.create({ key: 'plan-1', role: await Roles.findOne({ key: 'user' }) });
  await Users.create({
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
  const response = await request
    .post('/api/users/auth/signin')
    .send({ username: 'mohamed', password: '123@Ewasy' });
  cookie = response.headers['set-cookie'];
});

describe('create saved project list controller', () => {
  it('should return 200 when create a valid saved project', async () => {
    await request
      .post('/api/users/saved-projects')
      .send({
        title: 'my-favourite',
        projects: [(await Projects.findOne({ title: 'project-1' }))?.id],
      })
      .set('Cookie', cookie)
      .expect(200);

    const savedProject = await SavedProjects.findOne({ title: 'my-favourite' });
    expect(savedProject).toBeDefined();
    expect(savedProject?.projects.length).toBe(1);
  });
  it('should return 400 when create twice saved project with same title', async () => {
    await request
      .post('/api/users/saved-projects')
      .send({
        title: 'my-favourite',
        projects: [(await Projects.findOne({ title: 'project-1' }))?.id],
      })
      .set('Cookie', cookie)
      .expect(200);
    await request
      .post('/api/users/saved-projects')
      .send({
        title: 'my-favourite',
        projects: [(await Projects.findOne({ title: 'project-1' }))?.id],
      })
      .set('Cookie', cookie)
      .expect(400);
  });
});
