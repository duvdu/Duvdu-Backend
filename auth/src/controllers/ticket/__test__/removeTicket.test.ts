import mongoose, { Types } from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';
import { Ifeatures } from '../../../types/Features';

const request = supertest(app);
const id = new mongoose.Types.ObjectId().toHexString();
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


describe('remove ticket should be ' , ()=>{
  it('return 401 if user unauthenticated' , async()=>{
    await request.delete('/api/users/ticket/123').expect(401);
  });
  
  it('return 403 if user dont have this permission' , async()=>{
    await request.delete('/api/users/ticket/123')
      .set('Cookie' , cookieSession)
      .expect(403);
  });
  it('return 422 for invalid id format ' , async()=>{
    await mongoose.connection.db.collection('role').updateOne({_id: new Types.ObjectId(mongoId)} , { $set: { features: [Ifeatures.removeTicket] } });    
    await request.delete('/api/users/ticket/123')
      .set('Cookie' , cookieSession)
      .expect(422);
  });
  it('return 404 if ticket not found ' , async()=>{
    await mongoose.connection.db.collection('role').updateOne({_id: new Types.ObjectId(mongoId)} , { $set: { features: [Ifeatures.removeTicket] } });    
    await request.delete(`/api/users/ticket/${id}`)
      .set('Cookie' , cookieSession)
      .expect(404);
  });
  it('return 204 for success' , async ()=>{
    await mongoose.connection.db.collection('role').updateOne({_id: new Types.ObjectId(mongoId)} , { $set: { features: [Ifeatures.removeTicket] } });    
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
    const response = await mongoose.connection.db.collection('tickets').findOne({ name:'ssssssss'});
    await request.delete(`/api/users/ticket/${response?._id}`)
      .set('Cookie',cookieSession)
      .expect(204);
  });

});