import fs from 'fs';
import path from 'path';

import { PERMISSIONS , MODELS } from '@duvdu-v1/duvdu';
import mongoose, { Types } from 'mongoose';
import supertest from 'supertest';

import { app } from '../../app';
import { removeFiles } from '../../utils/file';

const request = supertest(app);

let cookieSession: string[];
beforeEach(async () => {
  await mongoose.connection.db.collection(MODELS.role).insertOne({ _id: new Types.ObjectId('65de2a09b32b9de15d963306'), key: 'free' });
  await mongoose.connection.db.collection(MODELS.plan).insertOne({ _id: new Types.ObjectId('65de2a09b32b9de15d96330f'), role: '65de2a09b32b9de15d963306' });

  await mongoose.connection.db.collection(MODELS.user).insertOne({
    id: '65ff30d5bb9950965d43dead',
    isVerified: {value:true },
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZmYzMGQ1YmI5OTUwOTY1ZDQzZGVhZCIsImlzQmxvY2tlZCI6eyJ2YWx1ZSI6ZmFsc2V9LCJpc1ZlcmlmaWVkIjpmYWxzZSwicm9sZSI6eyJrZXkiOiJ1bnZlcmlmaWVkIiwicGVybWlzc2lvbnMiOlsiY2hhbmdlUGFzc3dvcmQiLCJ1cGRhdGVQcm9maWxlIl19LCJpYXQiOjE3MTEyMjI5OTcsImV4cCI6MTcxMTY1NDk5N30.aGkU73UQSr5h34WbA1raJrbYP6VsqYbMhnQl9tYScyw',
    isBlocked: {
      value:false
    },
    status: { value: true },
    role:'65de2a09b32b9de15d963306'
  });
  

  const response = await request.get('/test').send();
  cookieSession = response.get('Set-Cookie');
});

describe('create category should ', () => {
  it('return 401 if user unAuthenticated' , async ()=>{
    await request.post('/api/category').send().expect(401);
  });  

  it('return 403 if user dont have permission to access', async () => {
    await request.post('/api/category')
      .send()
      .set('Cookie' , cookieSession)
      .expect(403);
  });
  it('return 422 for invalid input', async () => {
    await mongoose.connection.db.collection(MODELS.role)
      .updateOne({ key: 'free' }, { $set: { features: [PERMISSIONS.createCategory] } });

    await request.post('/api/category')
      .send()
      .set('Cookie' , cookieSession)
      .expect(422);
  });
  it('return 422 for invalid input', async () => {
    await mongoose.connection.db.collection(MODELS.role)
      .updateOne({ key: 'free' }, { $set: { features: [PERMISSIONS.createCategory] } });
    await request
      .post('/api/category')
      .send({
        title: '',
      })
      .set('Cookie' , cookieSession)
      .expect(422);
  });
  it('return 422 for invalid input', async () => {
    await mongoose.connection.db.collection(MODELS.role)
      .updateOne({ key: 'free' }, { $set: { features: [PERMISSIONS.createCategory] } });
    await request
      .post('/api/category')
      .send({
        title: '',
        image: '',
        cycle: 0,
        tags: '',
        jobTitles: '',
      })
      .set('Cookie' , cookieSession)
      .expect(422);
  });

  it('should return 422 for invalid input as formdata', async () => {
    await mongoose.connection.db.collection(MODELS.role)
      .updateOne({ key: 'free' }, { $set: { features: [PERMISSIONS.createCategory] } });
    await request
      .post('/api/category')
      .field('title', 'catogey')
      .attach('image', fs.readFileSync(path.join(__dirname, 'image.jpg')), 'image.jpg')
      .field('cycle', 1)
      .field('tags[0]', 'cat1')
      .field('jobTitles[0]', 'developer')
      .set('Content-Type', 'multipart/form-data')
      .set('Cookie',cookieSession)
      .expect(422);
  });
  it('should return 200 for success', async () => {
    await mongoose.connection.db.collection(MODELS.role)
      .updateOne({ key: 'free' }, { $set: { features: [PERMISSIONS.createCategory] } });
    await request
      .post('/api/category')
      .field('title.en', 'catogey')
      .field('title.ar', 'ةةةةةةة')
      .attach('image', fs.readFileSync(path.join(__dirname, 'image.jpg')), 'image.jpg')
      .field('cycle', 1)
      .field('tags[0]', 'cat1')
      .field('jobTitles[0]', 'developer')
      .set('Content-Type', 'multipart/form-data')
      .set('Cookie' , cookieSession)
      .expect(201);
    const response = await mongoose.connection.db.collection(MODELS.category)
      .findOne({ title:{en:'catogey' , ar:'ةةةةةةة'} });
      
    removeFiles(response?.image);
  });
});
