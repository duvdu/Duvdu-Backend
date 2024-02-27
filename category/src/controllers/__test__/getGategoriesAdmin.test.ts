
import mongoose, { Types } from 'mongoose';
import supertest from 'supertest';

import { app } from '../../app';
import { Ifeatures } from '../../types/Features';

const request = supertest(app);

let cookieSession: string[];
beforeEach(async () => {
  await mongoose.connection.db.collection('roles').insertOne({ _id: new Types.ObjectId('65de2a09b32b9de15d963305'), key: 'free' });
  await mongoose.connection.db.collection('plans').insertOne({ _id: new Types.ObjectId('65de2a09b32b9de15d96330f'), role: '65de2a09b32b9de15d963305' });

  await mongoose.connection.db.collection('users').insertOne({
    id: '65de2a09b32b9de15d96330d',
    isVerified: true,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZGUyYTA5YjMyYjlkZTE1ZDk2MzMwZCIsInBsYW5JZCI6IjY1ZGUyYTA5YjMyYjlkZTE1ZDk2MzMwZiIsImlhdCI6MTcwOTA1OTg4MX0.dLKNTuS_701l72jcs7thSchj1raK6548nxIkGHqEboE',
    isBlocked: false,
    status: { value: true },
    plan:'65de2a09b32b9de15d96330f'
  });

  const response = await request.get('/test').send();
  cookieSession = response.get('Set-Cookie');
});

describe('get admin category should' , ()=>{
  it('return 401 if user unAuthenticated' , async()=>{
    await request.get('/api/category/crm').expect(401);
  });
  it('return 403 if user unAuthenticated' , async()=>{
    await request.get('/api/category/crm').set('Cookie' , cookieSession).expect(403);
  });
  it('return 403 if user unAuthenticated' , async()=>{
    await mongoose.connection.db.collection('roles')
      .updateOne({ key: 'free' }, { $set: { features: [Ifeatures.getGategoriesAdmin] } });
    await request.get('/api/category/crm').set('Cookie' , cookieSession).expect(200);
  });
});