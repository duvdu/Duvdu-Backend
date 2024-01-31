import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';
import { hashPassword } from '../../../utils/bcrypt';

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
  console.log(
    await mongoose.connection.db.collection('users').insertOne({
      name: 'ewasy',
      username: 'ewasy_name',
      password: hashPassword('123@Metoo'),
      'password.number': '01234567891',
    }),
  );
});

describe('signin endpoint', () => {
  it('should return 403 if valid credintials but not verified account', async () => {
    const response = await request.post('/api/users/signin').send({
      username: 'ewasy_mohamed',
      password: '123@Metoo',
    });
    expect(response.status).toBe(403);
    expect(response.body).toEqual({ errors: [{ message: 'account not verified' }] });
  });

  it('should return 200 if valid valid credentials and verified account', async () => {
    await mongoose.connection.db
      .collection('users')
      .findOneAndUpdate({ username: 'ewasy_mohamed' }, { $set: { isVerified: true } });
    const response = await request.post('/api/users/signin').send({
      username: 'ewasy_mohamed',
      password: '123@Metoo',
    });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'success' });
    expect(response.headers['set-cookie'].toString()).toBeDefined();
    console.log(response.headers['set-cookie'], response.headers['set-cookie'].toString());
  });
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});
