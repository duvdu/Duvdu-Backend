import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../app';
import { env } from '../config/env';

const request = supertest(app);
declare global {
  const signin: () => Promise<string[]>;
}

let mongo: any;

beforeAll(async () => {
  env.jwt.secret = 'sadsadsadasdas';
  process.env.JWT_KEY = 'sadsadsadasdas';
  mongo = await MongoMemoryServer.create();
  const mongoUri = await mongo.getUri();
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

(global as any).signin = async () => {
  const response = await request.post('/api/users/signup').send({
    name: 'ewasy',
    username: 'ewasy_mohamed',
    password: '123@Metoo',
    phoneNumber: { number: '01234567891' },
    isVerified:true
  });

  const cookie = response.get('Set-Cookie');

  return cookie;
};
