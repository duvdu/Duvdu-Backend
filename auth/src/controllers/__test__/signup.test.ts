import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../app';

const request = supertest(app);
let mongo: MongoMemoryServer;
beforeAll(async () => {
  process.env.JWT_KEY = 'sadsadsadasdas';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri);
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

describe('signup endpoint', () => {
  it('should return 201 on valid signup', async () => {
    const response = await request.post('/api/users/signup').send({
      name: 'ewasy',
      username: 'ewasy_mohamed',
      password: '123@Metoo',
      phoneNumber: { number: '01234567891' },
    });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'success' });
    expect(Object.keys(response.body).length).toBe(1);
    expect(response.headers['set-cookie'].toString()).toBeDefined();
  });

  it('should return 400 if already exists username', async () => {
    const response = await request.post('/api/users/signup').send({
      name: 'ewasy',
      username: 'ewasy_mohamed',
      password: '123@Metoo',
      phoneNumber: { number: '01234567811' },
    });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ errors: [{ message: 'username is already exists' }] });
  });

  it('should return 400 if already exists phone number', async () => {
    const response = await request.post('/api/users/signup').send({
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
    const response = await request.post('/api/users/signup').send({
      username: 'ewasy_sadasd',
      password: '123@Metoo',
      phoneNumber: { number: '01234567891' },
    });
    expect(response.status).toBe(422);
  });
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});
