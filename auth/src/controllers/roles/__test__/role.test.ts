import supertest from 'supertest';

import { app } from '../../../app';
import { Plans } from '../../../models/Plan.model';
import { Roles } from '../../../models/Role.model';
import { Users } from '../../../models/User.model';
import { Ifeatures } from '../../../types/Permissions';
import { hashPassword } from '../../../utils/bcrypt';

const request = supertest(app);
let cookie: string;

beforeEach(async () => {
  const role = await Roles.create({ key: 'admin' });
  const plan = await Plans.create({ key: 'admin', status: true, role: role.id });
  await Users.create({
    username: 'ewasy',
    password: hashPassword('123@Ewasy'),
    isVerified: true,
    plan: plan.id,
  });
  const res = await request
    .post('/api/users/auth/signin')
    .send({ username: 'ewasy', password: '123@Ewasy' });
  cookie = res.headers['set-cookie'];
});

describe('role controllers', () => {
  it('should return 201 while creating new role', async () => {
    await request
      .post('/api/users/roles')
      .set('Cookie', cookie)
      .send({
        key: 'role-1',
        features: [Ifeatures.changePassword],
      })
      .expect(201);

    expect(await Roles.findOne({ key: 'role-1' })).toBeDefined();
  });

  it('should return 422 if invalid feature', async () => {
    await request
      .post('/api/users/roles')
      .set('Cookie', cookie)
      .send({
        key: 'role-1',
        features: ['invalid feature'],
      })
      .expect(422);
  });

  it('should get all roles', async () => {
    await Roles.create({ key: 'role-1', features: Object.values(Ifeatures) });
    const response = await request.get('/api/users/roles').set('Cookie', cookie);
    expect(response.status).toBe(200);
    expect(response.body.data[0].key).toBeDefined();
    expect(response.body.data[0].features).toBeUndefined();
  });

  // eslint-disable-next-line quotes
  it("should get one roles with it's features", async () => {
    const baseRole = await Roles.create({ key: 'role-1', features: Object.values(Ifeatures) });
    const response = await request.get(`/api/users/roles/${baseRole.id}`).set('Cookie', cookie);
    expect(response.status).toBe(200);
    expect(response.body.data.key).toEqual('role-1');
    expect(response.body.data.features).toBeDefined();
  });

  it('should return 200 if update role features', async () => {
    const baseRole = await Roles.create({ key: 'role-1' });
    const res1 = await request
      .put(`/api/users/roles/${baseRole.id}`)
      .set('Cookie', cookie)
      .send({ features: [Ifeatures.changePassword] });

    expect(res1.status).toBe(200);
    const role = await Roles.findById(baseRole.id);
    expect(role?.features[0]).toBe(Ifeatures.changePassword);
  });

  it('should return 204 while remove role expect admin role', async () => {
    const baseRole = await Roles.create({ key: 'test-role' });
    await request.delete(`/api/users/roles/${baseRole.id}`).set('Cookie', cookie).expect(204);
    const role = await Roles.findById(baseRole.id);
    expect(role).toBeNull();

    const adminRole = await Roles.findOne({ key: 'admin' });
    await request.delete(`/api/users/roles/${adminRole?.id}`).set('Cookie', cookie).expect(404);
  });
});
