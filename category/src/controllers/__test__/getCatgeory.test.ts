import fs from 'fs';
import path from 'path';

import { PERMISSIONS , MODELS } from '@duvdu-v1/duvdu';
import mongoose, { Types } from 'mongoose';
import supertest from 'supertest';

import { app } from '../../app';
import { removeFiles } from '../../utils/file';

const request = supertest(app);

const id = new mongoose.Types.ObjectId().toString();
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

describe('get category should' , ()=>{
  it('should return 422 for invalid id' , async()=>{
    await request.get('/api/category/123').expect(422);
  });
  it('should return 422 for invalid id' , async()=>{
    await request.get(`/api/category/${id}`).expect(404);
  });
  it('should return 404 if category status 0' , async ()=>{
    await mongoose.connection.db.collection(MODELS.role)
      .updateOne({ key: 'free' }, { $set: { features: [PERMISSIONS.createCategory] } });
    await request
      .post('/api/category')
      .field('id' , id)
      .field('title.en', 'catogey')
      .field('title.ar', 'ةةةةةةة')
      .attach('image', fs.readFileSync(path.join(__dirname, 'image.jpg')), 'image.jpg')
      .field('cycle', 1)
      .field('tags[0]', 'cat1')
      .field('status', 0)
      .field('jobTitles[0]', 'developer')
      .set('Content-Type', 'multipart/form-data')
      .set('Cookie' , cookieSession)
      .expect(201);
    
    const response = await mongoose.connection.db.collection(MODELS.category)
      .findOne({ title:{en:'catogey' , ar:'ةةةةةةة'} });
    await request.get(`/api/category/${response?._id}`).expect(404);
      
    removeFiles(response?.image);
  });
});