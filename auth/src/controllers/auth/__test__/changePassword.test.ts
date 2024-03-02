import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';
import { Plans } from '../../../models/Plan.model';
import { Roles } from '../../../models/Role.model';
import { Users } from '../../../models/User.model';
import { Ifeatures } from '../../../types/Features';
import { hashPassword } from '../../../utils/bcrypt';

const request = supertest(app);

let cookieSession: string[];
beforeEach(async () => {
  const mongoId = new mongoose.Types.ObjectId().toHexString();
  await Roles.create({ _id: mongoId, key: 'free', features: [Ifeatures.changePassword] });
  await Plans.create({ _id: mongoId, role: mongoId, key: 'free' });
  await Users.create({
    username: 'elewasy',
    password: hashPassword('123@Metoo'),
    name: 'mohamed elewasy',
    phoneNumber: { number: '01552159359' },
    isVerified: true,
    plan: mongoId,
  });

  const response = await request.post('/api/users/auth/signin').send({
    username: 'elewasy',
    password: '123@Metoo',
  });
  cookieSession = response.get('Set-Cookie');
});

describe('change password', () => {
  it('should return 401 if user not authenticated ', async () => {
    await request.patch('/api/users/auth/change-password').send().expect(401);
  });
  it('should return 422 for invalid input', async () => {
    await request
      .patch('/api/users/auth/change-password')
      .set('Cookie', cookieSession)
      .send()
      .expect(422);
  });
  it('should return 422 for invalid input', async () => {
    await request
      .patch('/api/users/auth/change-password')
      .set('Cookie', cookieSession)
      .send({
        oldPassword: '',
      })
      .expect(422);
  });
  it('should return 422 for invalid input', async () => {
    await request
      .patch('/api/users/auth/change-password')
      .set('Cookie', cookieSession)
      .send({
        newPassword: '123',
      })
      .expect(422);
  });
  it('should return 422 for invalid input', async () => {
    await request
      .patch('/api/users/auth/change-password')
      .set('Cookie', cookieSession)
      .send({
        newPassword: '123',
        oldPassword: '123',
      })
      .expect(422);
  });
  it('should return 401 for wrong old password', async () => {
    await request
      .patch('/api/users/auth/change-password')
      .set('Cookie', cookieSession)
      .send({
        newPassword: '123!Metoo',
        oldPassword: '123',
      })
      .expect(401);
  });
  it('should return 200 for success response', async () => {
    const response = await request
      .patch('/api/users/auth/change-password')
      .set('Cookie', cookieSession)
      .send({
        newPassword: '123@eeMetoo',
        oldPassword: '123@Metoo',
      })
      .expect(200);
    expect(response.body.message).toMatch('success');
  });
});
