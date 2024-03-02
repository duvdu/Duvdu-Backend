import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';
import { Iuser } from '../../../types/User';

const request = supertest(app);

beforeEach(async () => {
  const mongoId = new mongoose.Types.ObjectId().toHexString();
  await mongoose.connection.db.collection('role').insertOne({ id: mongoId, key: 'free' });
  await mongoose.connection.db.collection('plan').insertOne({ role: mongoId, key: 'free' });
});

describe('AuthController', () => {
  it('should return 201 on valid signup', async () => {
    const response = await request.post('/api/users/auth/signup').send({
      name: 'ewasy',
      username: 'ewasy_mohamed',
      password: '123@Metoo',
      phoneNumber: { number: '01234567891' },
    });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'success' });
    expect(Object.keys(response.body).length).toBe(1);
    expect(response.headers['set-cookie'].toString()).toBeDefined();
    const user = <Iuser>(
      await mongoose.connection.db.collection('user').findOne({ username: 'ewasy_mohamed' })
    );
    expect(user.plan).toBeDefined();
  });
  it('should return 400 if already exists username', async () => {
    await mongoose.connection.db.collection('user').insertOne({ username: 'ewasy_mohamed' });
    const response = await request.post('/api/users/auth/signup').send({
      name: 'ewasy',
      username: 'ewasy_mohamed',
      password: '123@Metoo',
      phoneNumber: { number: '01234567811' },
    });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ errors: [{ message: 'username is already exists' }] });
  });
  it('should return 400 if already exists phone number', async () => {
    await mongoose.connection.db
      .collection('user')
      .insertOne({ phoneNumber: { number: '01234567891' } });
    const response = await request.post('/api/users/auth/signup').send({
      name: 'ewasy',
      username: 'ewasy_sadasd',
      password: '123@Metoo',
      phoneNumber: { number: '01234567891' },
    });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errors: [{ message: 'phoneNumber.number is already exists' }],
    });
  });
  it('should return 422 if name not sent in request', async () => {
    const response = await request.post('/api/users/auth/signup').send({
      username: 'ewasy_sadasd',
      password: '123@Metoo',
      phoneNumber: { number: '01234567891' },
    });
    expect(response.status).toBe(422);
  });
  it('should return 422 if invalid username', async () => {
    const validUser = {
      name: 'ewasy',
      username: 'ewasy_mohamed',
      password: '123@Metoo',
      phoneNumber: { number: '01234567891' },
    };
    expect(
      (
        await request.post('/api/users/auth/signup').send({
          ...validUser,
          username: 'ewasy mohamed',
        })
      ).status,
    ).toBe(422);
    expect(
      (
        await request.post('/api/users/auth/signup').send({
          ...validUser,
          username: 'ewasymohamed ',
        })
      ).status,
    ).toBe(422);
    expect(
      (
        await request.post('/api/users/auth/signup').send({
          ...validUser,
          username: 'ewasy$mohamed',
        })
      ).status,
    ).toBe(422);
    expect(
      (
        await request.post('/api/users/auth/signup').send({
          ...validUser,
          username: 'ewasy.mohamed',
        })
      ).status,
    ).toBe(422);
    expect(
      (
        await request.post('/api/users/auth/signup').send({
          ...validUser,
          username: 'ewasy-mohamed',
        })
      ).status,
    ).toBe(422);
  });
});
