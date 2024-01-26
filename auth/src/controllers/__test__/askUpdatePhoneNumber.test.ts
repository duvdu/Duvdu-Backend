import supertest from 'supertest';

import { app } from '../../app';

const request = supertest(app);

describe('askUpdatePhoneNumber', () => {
  it('should return 401 if user un authenticate', async () => {
    await request.get('/api/users/update-phone-number').send({ password: '123@Metoo' }).expect(401);
  });
  it('should be return 422 validation error', async () => {
    await request
      .get('/api/users/update-phone-number')
      .set('Cookie', await signin())
      .send({ password: '12345' })
      .expect(422);
  });
  it('should return 401 if incorrect password', async () => {
    await request
      .get('/api/users/update-phone-number')
      .set('Cookie', await signin())
      .send({ password: '123@Metooooo' })
      .expect(401);
  });
  it('should return 200 when success ', async () => {
    await request
      .get('/api/users/update-phone-number')
      .set('Cookie', await signin())
      .send({ password: '123@Metoo' })
      .expect(200);
  });
});
