import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';

const request = supertest(app);



let cookieSession: string[];
beforeEach(async () => {
  const mongoId = new mongoose.Types.ObjectId().toHexString();
  await mongoose.connection.db.collection('role').insertOne({ id: mongoId, key: 'free' });
  await mongoose.connection.db.collection('plan').insertOne({ role: mongoId, key: 'free' });

  const response = await request.post('/api/users/signup').send({
    username: 'elewasy',
    password: '123@Metoo',
    name: 'mohamed elewasy',
    phoneNumber: { number: '01552159359' },
  });
  await mongoose.connection.db
    .collection('user')
    .updateOne({ username: 'elewasy' }, { $set: { isVerified: true } });
  cookieSession = response.get('Set-Cookie');
  
});

describe('change password' , ()=>{
  it('should return 401 if user not authenticated ', async () => {
    await request.patch('/api/users/change-password')
      .send()
      .expect(401);
  });
  it('should return 422 for invalid input', async () => {
    await request.patch('/api/users/change-password')
      .set('Cookie' , cookieSession)
      .send()
      .expect(422);
  });
  it('should return 422 for invalid input', async () => {
    await request.patch('/api/users/change-password')
      .set('Cookie' , cookieSession)
      .send({
        oldPassword:''
      })
      .expect(422);
  });
  it('should return 422 for invalid input', async () => {
    await request.patch('/api/users/change-password')
      .set('Cookie' , cookieSession)
      .send({
        newPassword:'123'
      })
      .expect(422);
  });
  it('should return 422 for invalid input', async () => {
    await request.patch('/api/users/change-password')
      .set('Cookie' , cookieSession)
      .send({
        newPassword:'123',
        oldPassword:'123'
      })
      .expect(422);
  });
  it('should return 401 for wrong old password', async () => {
    await request.patch('/api/users/change-password')
      .set('Cookie' , cookieSession)
      .send({
        newPassword:'123!Metoo',
        oldPassword:'123'
      })
      .expect(401);
  });
  it('should return 200 for success response', async () => {
    const response = await request.patch('/api/users/change-password')
      .set('Cookie' , cookieSession)
      .send({
        newPassword:'123@eeMetoo',
        oldPassword:'123@Metoo'
      })
      .expect(200);
    expect(response.body.message).toMatch('success');
      
  });
});