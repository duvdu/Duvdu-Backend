import request from 'supertest';

import { app } from '../../app';

describe('AuthController', () => {
  it('sign in with valid credentials should return 200', async () => {
    const response = await request(app).post('/api/auth'); // Specify the route
    expect(response.status).toBe(200);
    // Add other assertions based on your test case
  });
});
