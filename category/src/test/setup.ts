import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { env } from '../config/env';

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
