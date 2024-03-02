import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';
import { Plans } from '../../../models/Plan.model';
import { Roles } from '../../../models/Role.model';
import { Users } from '../../../models/User.model';
import { Ifeatures } from '../../../types/Features';
import { hashPassword } from '../../../utils/bcrypt';
import { hashVerificationCode } from '../../../utils/crypto';

const request = supertest(app);

let cookieSession: string[];
beforeEach(async () => {
  const mongoId = new mongoose.Types.ObjectId().toHexString();
  await Roles.create({ _id: mongoId, key: 'free', features: [Ifeatures.updatePhoneNumber] });
  await Plans.create({ _id: mongoId, role: mongoId, key: 'free' });
  await Users.create({
    username: 'elewasy',
    password: hashPassword('123@Metoo'),
    name: 'mohamed elewasy',
    phoneNumber: { number: '01552159359' },
    isVerified: true,
    plan: mongoId,
  });

  const response = await request.post('/api/users/auth/signin').send({
    username: 'elewasy',
    password: '123@Metoo',
  });
  cookieSession = response.get('Set-Cookie');
});

describe('update phone number', () => {
  it('should return 401 if user un authenticated ', async () => {
    await request.put('/api/users/auth/update-phone').send().expect(401);
  });
  it('should return 422 for invalid input ', async () => {
    await request
      .put('/api/users/auth/update-phone')
      .set('Cookie', cookieSession)
      .send()
      .expect(422);
  });
  it('should return 422 for invalid input ', async () => {
    await request
      .put('/api/users/auth/update-phone')
      .set('Cookie', cookieSession)
      .send({
        verificationCode: '',
      })
      .expect(422);
  });
  it('should return 422 for invalid input ', async () => {
    await request
      .post('/api/users/auth/update-phone')
      .set('Cookie', cookieSession)
      .send({
        password: '123@Metoo',
      })
      .expect(200);
    await request
      .put('/api/users/auth/update-phone')
      .set('Cookie', cookieSession)
      .send({
        verificationCode: '123',
      })
      .expect(422);
  });
  it('should return 422 for invalid input ', async () => {
    await request
      .put('/api/users/auth/update-phone')
      .set('Cookie', cookieSession)
      .send({
        verificationCode: '123456',
        phoneNumber: '21321321321',
      })
      .expect(422);
  });
  it('should return 401 for invalid or expired code ', async () => {
    await request
      .put('/api/users/auth/update-phone')
      .set('Cookie', cookieSession)
      .send({
        verificationCode: '123456',
        phoneNumber: '01022484942',
      })
      .expect(401);
  });
  it('should return 200 for success response', async () => {
    const randomCode = hashVerificationCode('123456');
    await request
      .post('/api/users/auth/update-phone')
      .set('Cookie', cookieSession)
      .send({
        password: '123@Metoo',
      })
      .expect(200);

    await mongoose.connection.db.collection('user').updateOne(
      { username: 'elewasy' },
      {
        $set: {
          verificationCode: {
            code: randomCode,
            expireAt: new Date(Date.now() + 60 * 1000).toString(),
          },
        },
      },
    );

    await request
      .put('/api/users/auth/update-phone')
      .set('Cookie', cookieSession)
      .send({
        verificationCode: '123456',
        phoneNumber: '01022484942',
      })
      .expect(200);
    const user = await mongoose.connection.db.collection('user').findOne({ username: 'elewasy' });
    expect(user?.isBlocked).toBeTruthy();
  });
});
