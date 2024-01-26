import supertest from 'supertest';

import { app } from '../../app';

const request = supertest(app);

describe('verifyUpdatePhoneNumber', () => {
  it('should return 422 for invalid input', async () => {
    // Test case 1: Invalid verification code length
    await request
      .put('/api/users/update-phone-number')
      .send({
        verificationCode: '123',
        phoneNumber: '01022484942',
      })
      .expect(422);

    // Test case 2: Invalid phone number length
    await request
      .put('/api/users/update-phone-number')
      .send({
        verificationCode: '123456',
        phoneNumber: '01022484',
      })
      .expect(422);

    // Test case 3: Missing verificationCode field
    await request
      .put('/api/users/update-phone-number')
      .send({
        phoneNumber: '01022484942',
      })
      .expect(422);

    // Test case 4: Missing phoneNumber field
    await request
      .put('/api/users/update-phone-number')
      .send({
        verificationCode: '123456',
      })
      .expect(422);
  });
});
