import fs from 'fs';
import path from 'path';

import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../app';
import { removeFiles } from '../../utils/file';

const request = supertest(app);

const id = new mongoose.Types.ObjectId().toHexString();

describe('update category should be', () => {
  it('should return 422 for invalid input', async () => {
    await request
      .put(`/api/category/${id}`)
      .field('title.ar', '')
      .set('Content-Type', 'multipart/form-data')
      .expect(422);
  });
  it('should return 422 for invalid input', async () => {
    await request
      .put(`/api/category/${id}`)
      .field('title.en', '')
      .field('title.ar', '')
      .attach('image', fs.readFileSync(path.join(__dirname, 'image.jpg')), 'image.jpg')
      .field('cycle', 1)
      .field('tags[0]', 'cat1')
      .field('jobTitles[0]', 'developer')
      .set('Content-Type', 'multipart/form-data')
      .expect(422);
  });
  it('should return 404 if catogry not found', async () => {
    await request
      .put(`/api/category/${id}`)
      .field('title.en', 'category')
      .field('title.ar', 'معتمد')
      .attach('image', fs.readFileSync(path.join(__dirname, 'image.jpg')), 'image.jpg')
      .field('jobTitles[0]', 'updated')
      .set('Content-Type', 'multipart/form-data')
      .expect(404);
  });
  it('should return 200 for success ', async () => {
    await request
      .post('/api/category')
      .field('title.en', 'category')
      .field('title.ar', 'ةةةةةةة')
      .attach('image', fs.readFileSync(path.join(__dirname, 'image.jpg')), 'image.jpg')
      .field('cycle', 1)
      .field('tags[0]', 'cat1')
      .field('jobTitles[0]', 'developer')
      .set('Content-Type', 'multipart/form-data')
      .expect(201);
    const category = await mongoose.connection.db
      .collection('categories')
      .findOne({ title: { en: 'category', ar: 'ةةةةةةة' } });
    await request
      .put(`/api/category/${category?._id}`)
      .field('title.en', 'category')
      .field('title.ar', 'معتمد')
      .attach('image', fs.readFileSync(path.join(__dirname, 'image.jpg')), 'image.jpg')
      .field('jobTitles[0]', 'updated')
      .set('Content-Type', 'multipart/form-data')
      .expect(200);
    const response = await request.get(`/api/category/${category?._id}`).expect(200);
    expect(response.body.data.title['ar']).toMatch('معتمد');
    expect(response.body.data.jobTitles[0]).toMatch('updated');
    removeFiles(response.body.data.image);
  });
});
