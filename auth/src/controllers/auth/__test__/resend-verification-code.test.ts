import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';
import { hashPassword } from '../../../utils/bcrypt';
import { hashVerificationCode } from '../../../utils/crypto';
import { generateRandom6Digit } from '../../../utils/gitRandom6Dugut';

const request = supertest(app);

describe('resend-verification-code controller', () => {
  it('should return 404 if username not exists', async () => {
    await request.post('/api/users/auth/resend-code').send({ username: 'guest_guest' }).expect(404);
  });
  it('should return 403 if no need to resend code', async () => {
    await mongoose.connection.db.collection('user').insertOne({
      username: 'guest_guest',
      password: hashPassword('password'),
    });
    await request.post('/api/users/auth/resend-code').send({ username: 'guest_guest' }).expect(403);
  });
  it('should return 400 if code not expired', async () => {
    await mongoose.connection.db.collection('user').insertOne({
      username: 'guest_guest',
      password: hashPassword('password'),
      verificationCode: {
        code: hashVerificationCode(generateRandom6Digit()),
        expireAt: new Date(Date.now() + 60 * 1000).toString(),
      },
    });
    await request.post('/api/users/auth/resend-code').send({ username: 'guest_guest' }).expect(400);
  });
  it('should return 200 if code expired', async () => {
    await mongoose.connection.db.collection('user').insertOne({
      username: 'guest_guest',
      password: hashPassword('password'),
      verificationCode: {
        code: hashVerificationCode(generateRandom6Digit()),
        expireAt: new Date(Date.now() - 60 * 1000).toString(),
      },
    });
    await request.post('/api/users/auth/resend-code').send({ username: 'guest_guest' }).expect(200);
  });
  it('should return 422 if invalid username', async () => {
    await request.post('/api/users/auth/resend-code').send({ username: 'user' }).expect(422);
  });
});
