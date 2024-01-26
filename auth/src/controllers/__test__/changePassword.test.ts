import supertest from 'supertest';

import { app } from '../../app';

const request = supertest(app);

describe('changePassword', () => {
  it('should return 401 if user un authenticated', async () => {
    await request
      .patch('/api/users/change-password')
      .send({
        oldPassword: '123@Metoo',
        newPassword: '123',
      })
      .expect(401);
  });

  it('should return 422 for invalid data', async () => {
    const user = await signin();
    await request
      .patch('/api/users/change-password')
      .set('Cookie', user)
      .send({
        oldPassword: '',
        newPassword: '1234@Metoo',
      })
      .expect(422);

    await request
      .patch('/api/users/change-password')
      .set('Cookie', user)
      .send({
        oldPassword: '123@Metoo',
        newPassword: '123',
      })
      .expect(422);
  });
  it('should return 401 incorrect password', async () => {
    await request
      .patch('/api/users/change-password')
      .set('Cookie', await signin())
      .send({
        oldPassword: '123676@Metoo',
        newPassword: '1234@Metoo',
      })
      .expect(401);
  });
  it('should return 200 for success', async () => {
    await request
      .patch('/api/users/change-password')
      .set('Cookie', await signin())
      .send({
        oldPassword: '123@Metoo',
        newPassword: '1234@Metoo',
      })
      .expect(200);
  });
});
