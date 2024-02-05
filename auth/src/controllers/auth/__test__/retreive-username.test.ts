import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';

const request = supertest(app);

describe('retreive-username controller', () => {
  it('should return 200 and user not exists', async () => {
    const response1 = await request
      .post('/api/users/retreive-username')
      .send({ username: 'mohamed' });
    expect(response1.status).toBe(200);
    expect(response1.body.isUsernameExists).toBeFalsy();
    const response2 = await request
      .post('/api/users/retreive-username')
      .send({ username: 'elewasy' });
    expect(response2.status).toBe(200);
    expect(response2.body.isUsernameExists).toBeFalsy();
  });
  it('should return 200 and user exists', async () => {
    await mongoose.connection.db
      .collection('user')
      .insertMany([{ username: 'mohamed' }, { username: 'elewasy' }]);
    const response1 = await request
      .post('/api/users/retreive-username')
      .send({ username: 'mohamed' });
    expect(response1.status).toBe(200);
    expect(response1.body.isUsernameExists).toBeTruthy();
    const response2 = await request
      .post('/api/users/retreive-username')
      .send({ username: 'elewasy' });
    expect(response2.status).toBe(200);
    expect(response2.body.isUsernameExists).toBeTruthy();
  });
  it('should return 422 when username not valid', async () => {
    const response = await request.post('/api/users/retreive-username').send({ username: 'ele' });
    expect(response.status).toBe(422);
  });
  it('should return 429 in case of too many requests', async () => {
    for (let i = 0; i < 20; i++) {
      await request.post('/api/users/retreive-username').send({ username: 'mohamedelewasy' });
    }
    await request
      .post('/api/users/retreive-username')
      .send({ username: 'mohamedelewasy' })
      .expect(429);
  });
});
