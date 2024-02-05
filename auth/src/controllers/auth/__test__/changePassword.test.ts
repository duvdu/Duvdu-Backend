import supertest from 'supertest';

import { app } from '../../../app';

const request = supertest(app);

describe('change password' , ()=>{
  it('should return 401 if user not authenticated ', async () => {
    await request.patch('/api/users/change-password')
      .send()
      .expect(401);
  });
  it('should return 422 for invalid input', async () => {
    await request.patch('/api/users/change-password')
      .set('Cookie' , await signin())
      .send()
      .expect(401);
  });
});