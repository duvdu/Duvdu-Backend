import mongoose, { Types } from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';

const request = supertest(app);
let cookieSession: string[];
const mongoId = new mongoose.Types.ObjectId().toHexString();
beforeEach(async () => {
  await mongoose.connection.db.collection('role').insertOne({ _id: new Types.ObjectId(mongoId), key: 'free' });
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

describe('getLoggedUserTicket should return' , ()=>{
  it('return 401 if user unauthenticated' , async()=>{
    await request.get('/api/users/ticket/loggedUserTicket').expect(401);
  });
  it('return 401 if user unauthenticated' , async()=>{
    await request.get('/api/users/ticket/loggedUserTicket')
      .set('Cookie' , cookieSession)
      .expect(404);
  });
  it('return 200 for success' , async () => {
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
    await request.get('/api/users/ticket/loggedUserTicket')
      .set('Cookie' , cookieSession)
      .expect(200);
  });
});