import supertest from 'supertest';

import { app } from '../../../app';
import { Plans } from '../../../models/Plan.model';
import { Roles } from '../../../models/Role.model';
import { Users } from '../../../models/User.model';
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

describe('plan controller', () => {
  it('should return 201 while create new plan', async () => {
    const role = await Roles.create({ key: 'new-plan' });
    await request
      .post('/api/users/plans')
      .send({ key: 'new-plan', title: 'new plan', role: role.id })
      .set('Cookie', cookie)
      .expect(201);

    const plan = await Plans.findOne({ key: 'new-plan' });
    expect(plan).toBeDefined();
  });

  it('should return 200 while update plan', async () => {
    const role = await Roles.create({ key: 'new-plan' });
    const plan = await Plans.create({ key: 'old-plan', role: role.id });

    await request
      .patch(`/api/users/plans/${plan.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'after update',
        status: true,
      })
      .expect(200);

    const newPlan = await Plans.findById(plan.id);
    expect(newPlan?.title).toBe('after update');
    expect(newPlan?.status).toBeTruthy();
  });

  it('should return all true plans without auth', async () => {
    await request.get('/api/users/plans').expect(200);
  });

  it('should return all plans with auth', async () => {
    await request.get('/api/users/plans/all').set('Cookie', cookie).expect(200);
    await request.get('/api/users/plans/all').expect(401);
  });

  it('should return 204 while remove plan', async () => {
    const plan = await Plans.create({ key: 'test-plan' });
    await request.delete(`/api/users/plans/${plan.id}`).set('Cookie', cookie).expect(204);

    const tempPlan = await Plans.findById(plan.id);
    expect(tempPlan).toBeNull();
  });
});
