import fs from 'fs';
import path from 'path';

import mongoose, { Types } from 'mongoose';
import supertest from 'supertest';

import { app } from '../../app';
import { Ifeatures } from '../../types/Features';
import { removeFiles } from '../../utils/file';

const request = supertest(app);

const id = new mongoose.Types.ObjectId().toString();
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

describe('get category should' , ()=>{
  it('should return 422 for invalid id' , async()=>{
    await request.get('/api/category/123').expect(422);
  });
  it('should return 422 for invalid id' , async()=>{
    await request.get(`/api/category/${id}`).expect(404);
  });
  it('should return 404 if category status 0' , async ()=>{
    await mongoose.connection.db.collection('roles')
      .updateOne({ key: 'free' }, { $set: { features: [Ifeatures.createCategory] } });
    await request
      .post('/api/category')
      .field('id' , id)
      .field('title.en', 'catogey')
      .field('title.ar', 'ةةةةةةة')
      .attach('image', fs.readFileSync(path.join(__dirname, 'image.jpg')), 'image.jpg')
      .field('cycle', 1)
      .field('tags[0]', 'cat1')
      .field('jobTitles[0]', 'developer')
      .set('Content-Type', 'multipart/form-data')
      .set('Cookie' , cookieSession)
      .expect(201);

    const response = await mongoose.connection.db.collection('categories')
      .findOne({ title:{en:'catogey' , ar:'ةةةةةةة'} });
    await request.get(`/api/category/${response?._id}`).expect(404);
      
    removeFiles(response?.image);
  });
});