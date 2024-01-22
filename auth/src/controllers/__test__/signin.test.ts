import supertest from 'supertest';

import { app } from '../../app';

const request = supertest(app);

describe('AuthController', () => {
  beforeAll(async () => {
    await request.post('/api/auth').send({ name: '' });
  });
});
