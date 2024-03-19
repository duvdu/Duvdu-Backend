import fs from 'fs';
import path from 'path';

import mongoose, { Types } from 'mongoose';
import supertest from 'supertest';

import { app } from '../../app';
import { Ifeatures } from '../../types/Features';
import { removeFiles } from '../../utils/file';

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
    await mongoose.connection.db.collection('role')
      .updateOne({ key: 'free' }, { $set: { features: [Ifeatures.createCategory] } });

    await request.post('/api/category')
      .send()
      .set('Cookie' , cookieSession)
      .expect(422);
  });
  it('return 422 for invalid input', async () => {
    await mongoose.connection.db.collection('role')
      .updateOne({ key: 'free' }, { $set: { features: [Ifeatures.createCategory] } });
    await request
      .post('/api/category')
      .send({
        title: '',
      })
      .set('Cookie' , cookieSession)
      .expect(422);
  });
  it('return 422 for invalid input', async () => {
    await mongoose.connection.db.collection('role')
      .updateOne({ key: 'free' }, { $set: { features: [Ifeatures.createCategory] } });
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
    await mongoose.connection.db.collection('role')
      .updateOne({ key: 'free' }, { $set: { features: [Ifeatures.createCategory] } });
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
    await mongoose.connection.db.collection('role')
      .updateOne({ key: 'free' }, { $set: { features: [Ifeatures.createCategory] } });
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
    const response = await mongoose.connection.db.collection('category')
      .findOne({ title:{en:'catogey' , ar:'ةةةةةةة'} });
      
    removeFiles(response?.image);
  });
});
