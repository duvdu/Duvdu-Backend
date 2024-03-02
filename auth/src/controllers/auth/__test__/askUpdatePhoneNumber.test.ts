import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';

const request = supertest(app);

let cookieSession: string[];
beforeEach(async () => {
  const mongoId = new mongoose.Types.ObjectId().toHexString();
  await mongoose.connection.db.collection('role').insertOne({ id: mongoId, key: 'free' });
  await mongoose.connection.db.collection('plan').insertOne({ role: mongoId, key: 'free' });

  const response = await request.post('/api/users/auth/signup').send({
    username: 'metoooo',
    password: '123@Metoo',
    name: 'mohamed elewasy',
    phoneNumber: { number: '01552159359' },
  });
  await mongoose.connection.db
    .collection('user')
    .updateOne({ username: 'metoooo' }, { $set: { isVerified: true } });
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
