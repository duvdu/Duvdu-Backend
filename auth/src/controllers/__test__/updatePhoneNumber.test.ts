import supertest from 'supertest';

import { app } from '../../app';

const request = supertest(app);

describe('updatePhoneNumber', () => {
  it('should return 401 if user un authenticated', async () => {
    await request
      .post('/api/users/update-phone-number')
      .send({
        verificationCode: '123456',
        phoneNumber: '01022484942',
      })
      .expect(401);
  });

  it('should return 422 for invalid input', async () => {
    const user = await signin();
    await request
      .post('/api/users/update-phone-number')
      .set('Cookie', user)
      .send({
        verificationCode: '1234',
        phoneNumber: '01022484942',
      })
      .expect(422);

    await request
      .post('/api/users/update-phone-number')
      .set('Cookie', user)
      .send({
        verificationCode: '123456',
        phoneNumber: '0102248',
      })
      .expect(422);
  });

  it('should return 401 for invalid verification code ', async () => {
    await request
      .post('/api/users/update-phone-number')
      .set('Cookie', await signin())
      .send({
        verificationCode: '123456',
        phoneNumber: '01022484942',
      })
      .expect(401);
  });
});
