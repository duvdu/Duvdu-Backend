
import { MODELS , PERMISSIONS } from '@duvdu-v1/duvdu';
import mongoose, { Types } from 'mongoose';
import supertest from 'supertest';

import { app } from '../../app';

const request = supertest(app);

let cookieSession: string[];
beforeEach(async () => {
  await mongoose.connection.db.collection(MODELS.role).insertOne({ _id: new Types.ObjectId('65de2a09b32b9de15d963306'), key: 'free' });
  await mongoose.connection.db.collection(MODELS.plan).insertOne({ _id: new Types.ObjectId('65de2a09b32b9de15d96330f'), role: '65de2a09b32b9de15d963306' });

  await mongoose.connection.db.collection(MODELS.user).insertOne({
    id: '65de2a09b32b9de15d96330d',
    isVerified: {value:true },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZmYzMGQ1YmI5OTUwOTY1ZDQzZGVhZCIsImlzQmxvY2tlZCI6eyJ2YWx1ZSI6ZmFsc2V9LCJpc1ZlcmlmaWVkIjpmYWxzZSwicm9sZSI6eyJrZXkiOiJ1bnZlcmlmaWVkIiwicGVybWlzc2lvbnMiOlsiY2hhbmdlUGFzc3dvcmQiLCJ1cGRhdGVQcm9maWxlIl19LCJpYXQiOjE3MTEyMjI5OTcsImV4cCI6MTcxMTY1NDk5N30.aGkU73UQSr5h34WbA1raJrbYP6VsqYbMhnQl9tYScyw',
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
    await mongoose.connection.db.collection(MODELS.role)
      .updateOne({ key: 'free' }, { $set: { features: [PERMISSIONS.getAdminCategories] } });
    await request.get('/api/category/crm').set('Cookie' , cookieSession).expect(200);
  });
});