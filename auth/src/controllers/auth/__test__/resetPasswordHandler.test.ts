import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';
import { hashVerificationCode } from '../../../utils/crypto';
const request = supertest(app);

beforeEach(async () => {
  const mongoId = new mongoose.Types.ObjectId().toHexString();
  await mongoose.connection.db.collection('role').insertOne({ id: mongoId, key: 'admin' });
  await mongoose.connection.db.collection('plan').insertOne({ role: mongoId, key: 'admin' });

  await request.post('/api/users/signup').send({
    username: 'metoooo',
    password: '123@Metoo',
    name: 'mohamed elewasy',
    phoneNumber: { number: '01552159359' },
  });
  await mongoose.connection.db
    .collection('user')
    .updateOne({ username: 'metoooo' }, { $set: { isVerified: true } });
});

describe('resetPassword', () => {
  it('should return 422 for invalid input ', async () => {
    await request.post('/api/users/reset-password').send({}).expect(422);
  });
  it('should return 422 for invalid input ', async () => {
    await request
      .post('/api/users/reset-password')
      .send({
        verificationCode: '',
      })
      .expect(422);
  });
  it('should return 422 for invalid input ', async () => {
    await request
      .post('/api/users/reset-password')
      .send({
        verificationCode: '123456',
        newPassword: '',
      })
      .expect(422);
  });
  it('should return 422 for invalid input ', async () => {
    await request
      .post('/api/users/reset-password')
      .send({
        verificationCode: '123456',
        newPassword: '123',
        username: '',
      })
      .expect(422);
  });
  it('should return 422 for invalid input ', async () => {
    await request
      .post('/api/users/reset-password')
      .send({
        verificationCode: '123456',
        newPassword: '123@Jhhh',
        username: 'ds',
      })
      .expect(422);
  });
  it('should return 404 if user not found ', async () => {
    await request
      .post('/api/users/reset-password')
      .send({
        verificationCode: '123456',
        newPassword: '123@Jhhh',
        username: 'mohamed',
      })
      .expect(404);
  });
  it('should return 401 for invalid or expire code ', async () => {
    await request
      .post('/api/users/reset-password')
      .send({
        verificationCode: '123456',
        newPassword: '123@Jhhh',
        username: 'metoooo',
      })
      .expect(401);
  });
  it('should return 200 for success ', async () => {
    const randomCode = hashVerificationCode('123456');
    await request
      .get('/api/users/reset-password')
      .send({
        username: 'metoooo',
      })
      .expect(200);
    const user = await mongoose.connection.db.collection('user').findOne({ username: 'metoooo' });
    expect(user?.isVerified).toBeFalsy;

    await mongoose.connection.db
      .collection('user')
      .updateOne(
        { username: 'metoooo' },
        {
          $set: {
            verificationCode: {
              code: randomCode,
              expireAt: new Date(Date.now() + 60 * 1000).toString(),
            },
          },
        },
      );

    await request
      .post('/api/users/reset-password')
      .send({
        verificationCode: '123456',
        newPassword: '123@Jhhh',
        username: 'metoooo',
      })
      .expect(200);
  });
});
