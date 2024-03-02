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


describe('create ticket should' , ()=>{
  it('return 401 if user not authenticated' , async () =>{
    await request.post('/api/users/ticket').send().expect(401);
  });
  it('should return 422 for invalid input' , async ()=>{
    await request.post('/api/users/ticket')
      .set('Cookie' , cookieSession)
      .send({
        name:'ss'
      })
      .expect(422);
  });
  it('should return 422 for invalid input' , async ()=>{
    await request.post('/api/users/ticket')
      .set('Cookie' , cookieSession)
      .send({
        name:'ss',
        phoneNumber:'32132321'
      })
      .expect(422);
  });
  it('should return 422 for invalid input' , async ()=>{
    await request.post('/api/users/ticket')
      .set('Cookie' , cookieSession)
      .send({
        name:'ssssssss',
        phoneNumber:{
          number:'0102248'
        }
      })
      .expect(422);
  });
  it('should return 422 for invalid input' , async ()=>{
    await request.post('/api/users/ticket')
      .set('Cookie' , cookieSession)
      .send({
        name:'ssssssss',
        phoneNumber:{
          number:'01022484942'
        },
        message:'dsadasda'
      })
      .expect(422);
  });
  it('should return 201 for success' , async ()=>{
    await request.post('/api/users/ticket')
      .set('Cookie' , cookieSession)
      .send({
        name:'ssssssss',
        phoneNumber:{
          number:'01022484942'
        },
        message:'dsadasdadasdasdasdasdadas'
      })
      .expect(201);
  });
});