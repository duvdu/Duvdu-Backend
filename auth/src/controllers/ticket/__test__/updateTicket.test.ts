import mongoose, { Types } from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';
import { Ifeatures } from '../../../types/Permissions';

const request = supertest(app);
const id = new mongoose.Types.ObjectId().toHexString();
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

describe('update ticket should ', () => {
  it('return 401 if user unauthenticate', async () => {
    await request.put(`/api/users/tickets/${id}`).expect(401);
  });
  it('return 403 if user dont have this permission', async () => {
    await request.put(`/api/users/tickets/${id}`).set('Cookie', cookieSession).expect(403);
  });
  it('return 422 if for invalid input', async () => {
    await mongoose.connection.db
      .collection('role')
      .updateOne(
        { _id: new Types.ObjectId(mongoId) },
        { $set: { features: [Ifeatures.updateTicket] } },
      );
    await request.put(`/api/users/tickets/${id}`).set('Cookie', cookieSession).expect(422);
  });
  it('return 422 if for invalid input', async () => {
    await mongoose.connection.db
      .collection('role')
      .updateOne(
        { _id: new Types.ObjectId(mongoId) },
        { $set: { features: [Ifeatures.updateTicket] } },
      );
    await request.put('/api/users/tickets/123').set('Cookie', cookieSession).expect(422);
  });
  it('return 200 for success', async () => {
    await mongoose.connection.db
      .collection('role')
      .updateOne(
        { _id: new Types.ObjectId(mongoId) },
        { $set: { features: [Ifeatures.updateTicket] } },
      );
    await request
      .post('/api/users/tickets')
      .set('Cookie', cookieSession)
      .send({
        name: 'ssssssss',
        phoneNumber: {
          number: '01022484942',
        },
        message: 'dsadasdadasdasdasdasdadas',
      })
      .expect(201);
    const response = await mongoose.connection.db
      .collection('tickets')
      .findOne({ name: 'ssssssss' });
    await request
      .put(`/api/users/tickets/${response?._id}`)
      .set('Cookie', cookieSession)
      .send({
        state: {
          feedback: 'sdadadadaadas',
        },
      })
      .expect(200);
  });
});
