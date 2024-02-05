import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';
import { hashPassword } from '../../../utils/bcrypt';

const request = supertest(app);

describe('signin endpoint', () => {
  it('should return 403 if valid credintials but not verified account', async () => {
    await mongoose.connection.db
      .collection('user')
      .insertOne({ username: 'ewasy_mohamed', password: hashPassword('123@Metoo') });
    const response = await request.post('/api/users/signin').send({
      username: 'ewasy_mohamed',
      password: '123@Metoo',
    });
    expect(response.status).toBe(403);
    expect(response.body).toEqual({ errors: [{ message: 'un-unauthorized error' }] });
  });

  it('should return 401 if in-valid credintials', async () => {
    await mongoose.connection.db
      .collection('user')
      .insertOne({ username: 'ewasy_mohamed', password: hashPassword('123@Metoo') });
    const response = await request.post('/api/users/signin').send({
      username: 'ewasy_mohamed',
      password: '123@Metoooo',
    });
    expect(response.status).toBe(401);
  });

  it('should return 200 if valid credentials and verified account', async () => {
    await mongoose.connection.db.collection('user').insertOne({
      username: 'ewasy_mohamed',
      password: hashPassword('123@Metoo'),
      isVerified: true,
    });
    const response = await request.post('/api/users/signin').send({
      username: 'ewasy_mohamed',
      password: '123@Metoo',
    });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'success' });
    expect(response.headers['set-cookie'].toString()).toBeDefined();
  });
});
