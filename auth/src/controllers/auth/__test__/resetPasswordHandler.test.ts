import supertest from 'supertest';

import { app } from '../../../app';

const request = supertest(app);

describe('resetPassword', () => {
  it('should return 422 for invalid input ', async() => {
    request.post('reset-password')
      .send()
      .expect(422);
  });
  it('should return 422 for invalid input ', async() => {
    request.post('reset-password')
      .send({
        verificationCode:'787'
      })
      .expect(422);
  });
  it('should return 422 for invalid input ', async() => {
    request.post('reset-password')
      .send({
        verificationCode:'90909',
        newPassword:'77887'
      })
      .expect(422);
  });
  it('should return 422 for invalid input ', async() => {
    request.post('reset-password')
      .send({
        verificationCode:'123456',
        newPassword:'01022484942',
        username:'hj'
      })
      .expect(422);
  });

});
