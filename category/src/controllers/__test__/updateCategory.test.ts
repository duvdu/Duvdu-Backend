import fs from 'fs';
import path from 'path';

import mongoose, { Types } from 'mongoose';
import supertest from 'supertest';

import { app } from '../../app';
import { Ifeatures } from '../../types/Features';
import { removeFiles } from '../../utils/file';

const request = supertest(app);

const id = new mongoose.Types.ObjectId().toHexString();
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

describe('update category should be', () => {


  it('should return 401 if user unauthenticated', async () => {
    await request
      .put(`/api/category/${id}`)
      .field('title.ar', '')
      .set('Content-Type', 'multipart/form-data')
      .expect(401);
  });
  it('should return 403 if user dont have apermission', async () => {
    await request
      .put(`/api/category/${id}`)
      .field('title.ar', '')
      .set('Content-Type', 'multipart/form-data')
      .set('Cookie' , cookieSession)
      .expect(403);
  });
  it('should return 422 for invalid input', async () => {
    await mongoose.connection.db.collection('role')
      .updateOne({ key: 'free' }, { $set: { features: [Ifeatures.updateCategory] } });
    await request
      .put(`/api/category/${id}`)
      .field('title.ar', '')
      .set('Content-Type', 'multipart/form-data')
      .set('Cookie' , cookieSession)
      .expect(422);
  });
  it('should return 422 for invalid input', async () => {
    await mongoose.connection.db.collection('role')
      .updateOne({ key: 'free' }, { $set: { features: [Ifeatures.updateCategory] } });
    await request
      .put(`/api/category/${id}`)
      .field('title.en', '')
      .field('title.ar', '')
      .attach('image', fs.readFileSync(path.join(__dirname, 'image.jpg')), 'image.jpg')
      .field('cycle', 1)
      .field('tags[0]', 'cat1')
      .field('jobTitles[0]', 'developer')
      .set('Content-Type', 'multipart/form-data')
      .set('Cookie' , cookieSession)
      .expect(422);
  });
  it('should return 404 if catogry not found', async () => {
    await mongoose.connection.db.collection('role')
      .updateOne({ key: 'free' }, { $set: { features: [Ifeatures.updateCategory] } });
    await request
      .put(`/api/category/${id}`)
      .field('title.en', 'category')
      .field('title.ar', 'معتمد')
      .attach('image', fs.readFileSync(path.join(__dirname, 'image.jpg')), 'image.jpg')
      .field('jobTitles[0]', 'updated')
      .set('Content-Type', 'multipart/form-data')
      .set('Cookie' , cookieSession)
      .expect(404);
  });
  it('should return 422 if user dont have permission to create category ', async () => {
    await mongoose.connection.db.collection('role')
      .updateOne({ key: 'free' }, { $set: { features: [Ifeatures.updateCategory] } });
    await request
      .post('/api/category')
      .field('title.en', 'category')
      .field('title.ar', 'ةةةةةةة')
      .attach('image', fs.readFileSync(path.join(__dirname, 'image.jpg')), 'image.jpg')
      .field('cycle', 1)
      .field('tags[0]', 'cat1')
      .field('jobTitles[0]', 'developer')
      .set('Content-Type', 'multipart/form-data')
      .set('Cookie' , cookieSession)
      .expect(403);
    const category = await mongoose.connection.db
      .collection('category')
      .findOne({ title: { en: 'category', ar: 'ةةةةةةة' } });
    await request
      .put(`/api/category/${category?._id}`)
      .field('title.en', 'category')
      .field('title.ar', 'معتمد')
      .attach('image', fs.readFileSync(path.join(__dirname, 'image.jpg')), 'image.jpg')
      .field('jobTitles[0]', 'updated')
      .set('Content-Type', 'multipart/form-data')
      .set('Cookie' , cookieSession)
      .expect(422);
    await request.get(`/api/category/${category?._id}`).expect(422);
  });
  it('should return 200 for success ', async () => {
    await mongoose.connection.db.collection('role')
      .updateOne({ key: 'free' }, { $set: { features: [Ifeatures.updateCategory , Ifeatures.createCategory] } });
    await request
      .post('/api/category')
      .field('title.en', 'category')
      .field('title.ar', 'ةةةةةةة')
      .attach('image', fs.readFileSync(path.join(__dirname, 'image.jpg')), 'image.jpg')
      .field('cycle', 1)
      .field('tags[0]', 'cat1')
      .field('jobTitles[0]', 'developer')
      .set('Content-Type', 'multipart/form-data')
      .set('Cookie' , cookieSession)
      .expect(201);
    const category = await mongoose.connection.db
      .collection('category')
      .findOne({ title: { en: 'category', ar: 'ةةةةةةة' } });
    await request
      .put(`/api/category/${category?._id}`)
      .field('title.en', 'category')
      .field('title.ar', 'معتمد')
      .attach('image', fs.readFileSync(path.join(__dirname, 'image.jpg')), 'image.jpg')
      .field('jobTitles[0]', 'updated')
      .set('Content-Type', 'multipart/form-data')
      .set('Cookie' , cookieSession)
      .expect(200);
    const response = await mongoose.connection.db.collection('category')
      .findOne({ _id: category?._id });
      
    expect(response?.title['ar']).toMatch('معتمد');
    expect(response?.jobTitles[0]).toMatch('updated');
    removeFiles(response?.image);
  });
});
