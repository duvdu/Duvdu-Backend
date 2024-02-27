import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';

const request = supertest(app);

beforeEach(async () => {
  const mongoId = new mongoose.Types.ObjectId().toHexString();
  await mongoose.connection.db.collection('role').insertOne({ id: mongoId, key: 'free' });
  await mongoose.connection.db.collection('plan').insertOne({ role: mongoId, key: 'free' });

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

describe('ask reset password' , ()=>{
  it('should return 422 for invalid input ', async () => {
    await request.get('/api/users/reset-password')
      .send()
      .expect(422);
  });
  it('should return 422 for invalid input ', async () => {
    await request.get('/api/users/reset-password')
      .send({
        name:'dd'
      })
      .expect(422);
  });
  it('should return 422 for invalid input ', async () => {
    await request.get('/api/users/reset-password')
      .send({
        username:'dd'
      })
      .expect(422);
  });
  it('should return 404 if user not found ', async () => {
    await request.get('/api/users/reset-password')
      .send({
        username:'motemedkhaled'
      })
      .expect(404);
  });
  it('should return 200 for successs ', async () => {
    await request.get('/api/users/reset-password')
      .send({
        username:'metoooo'
      })
      .expect(200);
    const user = await mongoose.connection.db.collection('user').findOne({username:'metoooo'});
    expect(user?.isVerified).toBeFalsy;
  });
});
