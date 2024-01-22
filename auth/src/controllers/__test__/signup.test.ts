import supertest from 'supertest';

import { app } from '../../app';

const request = supertest(app);

describe('AuthController', () => {
  it('should return 201 on valid signup', async () => {
    const response = await request.post('/api/auth').send({
      name: 'ewasy',
      username: 'ewasy',
      password: '123@Metoo',
      phoneNumber: { number: '01234567891' },
    });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'success' });
    expect(Object.keys(response.body).length).toBe(1);
    console.log(response.headers['set-cookie'].toString());
  });
});
