
import mongoose, { Types } from 'mongoose';
import supertest from 'supertest';

import { app } from '../../app';
import { Ifeatures } from '../../types/Features';

const request = supertest(app);

let cookieSession: string[];
beforeEach(async () => {
  await mongoose.connection.db.collection('role').insertOne({ _id: new Types.ObjectId('65de2a09b32b9de15d963306'), key: 'free' });
  await mongoose.connection.db.collection('plan').insertOne({ _id: new Types.ObjectId('65de2a09b32b9de15d96330f'), role: '65de2a09b32b9de15d963306' });

  await mongoose.connection.db.collection('user').insertOne({
    id: '65de2a09b32b9de15d96330d',
    isVerified: {value:true },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjlmOTEzMzNiNTg0ODA3YTg1NDg2MCIsInBlcm1lc3Npb24iOlsidXBkYXRlUHJvZmlsZSJdLCJpYXQiOjE3MTA4ODEwNDMsImV4cCI6MTcxMDg4MTEwM30.e211RTlR7mgiDFEYT8KAYuAdw_2CTIQc2cCmCpQZAQw',
    isBlocked: false,
    status: { value: true },
    role:'65de2a09b32b9de15d963306'
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
    await mongoose.connection.db.collection('role')
      .updateOne({ key: 'free' }, { $set: { features: [Ifeatures.getGategoriesAdmin] } });
    await request.get('/api/category/crm').set('Cookie' , cookieSession).expect(200);
  });
});