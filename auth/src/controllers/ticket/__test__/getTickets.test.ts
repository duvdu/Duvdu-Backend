import mongoose, { Types } from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';
import { Ifeatures } from '../../../types/Permissions';

const request = supertest(app);
let cookieSession: string[];
const mongoId = new mongoose.Types.ObjectId().toHexString();
beforeEach(async () => {
  await mongoose.connection.db
    .collection('role')
    .insertOne({ _id: new Types.ObjectId(mongoId), key: 'free' });
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

describe('getTickets should ', () => {
  it('return 401 if user unauthenticated', async () => {
    await request.get('/api/users/tickets').expect(401);
  });
  it('return 403 if user dont have permission', async () => {
    await request.get('/api/users/tickets').set('Cookie', cookieSession).expect(403);
  });

  it('return 200 for success', async () => {
    await mongoose.connection.db
      .collection('role')
      .updateOne(
        { _id: new Types.ObjectId(mongoId) },
        { $set: { features: [Ifeatures.getAllTickets] } },
      );
    await request.get('/api/users/tickets').set('Cookie', cookieSession).expect(200);
  });
});
