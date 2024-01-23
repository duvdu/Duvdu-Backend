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

beforeAll(async () => {
  await request.post('/api/users/signup').send({
    name: 'ewasy',
    username: 'ewasy_mohamed',
    password: '123@Metoo',
    phoneNumber: { number: '01234567891' },
  });
});

fdescribe('signin endpoint', () => {
  it('should return 403 if valid credintials but not verified account', async () => {
    const response = await request.post('/api/users/signin').send({
      username: 'ewasy_mohamed',
      password: '123@Metoo',
    });
    expect(response.status).toBe(403);
    expect(response.body).toEqual({ errors: [{ message: 'account not verified' }] });
  });

  it('should return 400 if valid valid credentials and verified account', async () => {
    await mongoose.connection.db.collection('users').updateOne();
    const response = await request.post('/api/users/signin').send({
      username: 'ewasy_mohamed',
      password: '<PASSWORD>',
    });
  });
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});
