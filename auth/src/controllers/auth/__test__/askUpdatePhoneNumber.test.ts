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
  await Roles.create({ _id: mongoId, key: 'free', features: [Ifeatures.updatePhoneNumber] });
  await Plans.create({ _id: mongoId, role: mongoId, key: 'free' });
  await Users.create({
    username: 'metoooo',
    password: hashPassword('123@Metoo'),
    name: 'mohamed elewasy',
    phoneNumber: { number: '01552159359' },
    isVerified: true,
    plan: mongoId,
  });

  const response = await request.post('/api/users/auth/signin').send({
    username: 'metoooo',
    password: '123@Metoo',
  });
  cookieSession = response.get('Set-Cookie');
});

describe('ask update phone number', () => {
  it('should return 401 if user un authenticated ', async () => {
    await request.post('/api/users/auth/update-phone').send().expect(401);
  });
  it('should return 422 for invalid inputs ', async () => {
    await request
      .post('/api/users/auth/update-phone')
      .set('Cookie', cookieSession)
      .send({})
      .expect(422);
  });
  it('should return 422 for invalid inputs ', async () => {
    await request
      .post('/api/users/auth/update-phone')
      .set('Cookie', cookieSession)
      .send({
        password: '123',
      })
      .expect(422);
  });
  it('should return 401 for incorrect password ', async () => {
    await request
      .post('/api/users/auth/update-phone')
      .set('Cookie', cookieSession)
      .send({
        password: '123@Metoooo',
      })
      .expect(401);
  });
  it('should return 200 for success ', async () => {
    await request
      .post('/api/users/auth/update-phone')
      .set('Cookie', cookieSession)
      .send({
        password: '123@Metoo',
      })
      .expect(200);

    const user = await mongoose.connection.db.collection('user').findOne({ username: 'metoooo' });
    expect(user?.verificationCode.code).toBeDefined();
  });
});
