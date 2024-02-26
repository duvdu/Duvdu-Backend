import fs from 'fs';
import path from 'path';

import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../app';

const request = supertest(app);

const id = new mongoose.Types.ObjectId().toString();

describe('remove category ', () => {
  it('should be return 422 for invalid id', async () => {
    await request.delete('/api/category/123').expect(422);
  });

  it('should return 404 if category not found', async () => {
    await request.delete(`/api/category/${id}`).expect(404);
  });

  it('should return 200 for success', async () => {
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

    await request.delete(`/api/category/${category?._id}`).expect(204);
  });
});
