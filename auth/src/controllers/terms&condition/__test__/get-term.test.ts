import mongoose, { Types } from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';
import { Ifeatures } from '../../../types/Features';

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

describe('get term should', () => {
  it('return 404 if not found' , async ()=>{
    await request.get('/api/users/terms').expect(404);
  });
  it('return 404 if not found' , async ()=>{
    await mongoose.connection.db.collection('role').updateOne({_id: new Types.ObjectId(mongoId)} , { $set: { features: [Ifeatures.createTerm] } });    

    await request.post('/api/users/terms')
      .set('Cookie' , cookieSession)
      .send({
        desc:'sadasdasd'
      })
      .expect(201);
    await request.get('/api/users/terms').expect(200);
  });
});
