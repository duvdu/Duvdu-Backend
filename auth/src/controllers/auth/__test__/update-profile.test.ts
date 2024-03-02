import fs from 'fs';
import path from 'path';

import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';
import { Plans } from '../../../models/Plan.model';
import { Roles } from '../../../models/Role.model';
import { Users } from '../../../models/User.model';
import { Ifeatures } from '../../../types/Features';
import { hashPassword } from '../../../utils/bcrypt';

const request = supertest(app);

let cookieSession: string[];
beforeEach(async () => {
  const mongoId = new mongoose.Types.ObjectId().toHexString();
  await Roles.create({ _id: mongoId, key: 'free', features: [Ifeatures.updateProfile] });
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

describe('update-profile controller', () => {
  it('should return 422 if update sensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('googleId', 'googleId')
      .expect(422);
  });
  it('should return 422 if update sensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('appleId', 'appleId')
      .expect(422);
  });
  it('should return 422 if update sensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('phoneNumber[number]', '01234567899')
      .field('phoneNumber[code]', '+2')
      .expect(422);
  });
  it('should return 422 if update sensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('username', 'username')
      .expect(422);
  });
  it('should return 422 if update sensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('password', 'passworD@1')
      .expect(422);
  });
  it('should return 422 if update sensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('verificationCode[code]', 'stringCode')
      .field('verificationCode[expireAt]', new Date().toISOString())
      .expect(422);
  });
  it('should return 422 if update sensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('token', 'token')
      .expect(422);
  });
  it('should return 200 if update unsensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('name', 'mohamed mostafa elewasy')
      .expect(200);
  });
  it('should return 200 if update unsensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .attach('coverImage', fs.readFileSync(path.join(__dirname, 'image.jpg')), 'image.jpg')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .expect(200);
    const user = await mongoose.connection.db.collection('user').findOne({ username: 'elewasy' });
    expect(user?.coverImage).toBeDefined();
    expect((user?.coverImage as string).endsWith('jpg')).toBeTruthy();
  });
  it('should return 200 if update unsensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .attach('profileImage', fs.readFileSync(path.join(__dirname, 'image.jpg')), 'image.jpg')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .expect(200);
    const user = await mongoose.connection.db.collection('user').findOne({ username: 'elewasy' });
    expect(user?.profileImage).toBeDefined();
    expect((user?.profileImage as string).endsWith('jpg')).toBeTruthy();
  });
  it('should return 200 if update unsensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('location[lat]', '40.1234654')
      .field('location[lng]', '45.5469632')
      .expect(200);
  });
  it('should return 200 if update unsensitive field', async () => {
    const categoryId = new mongoose.Types.ObjectId();
    await mongoose.connection.db
      .collection('category')
      .insertOne({ _id: categoryId, title: 'cat1' });
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('category', categoryId.toString())
      .expect(200);
  });
  it('should return 404 if update invalid field', async () => {
    const categoryId = new mongoose.Types.ObjectId();
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('category', categoryId.toString())
      .expect(404);
  });
  it('should return 422 if unsensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('acceptedProjectsCounter', '5')
      .expect(422);
  });
  it('should return 422 if unsensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('profileViews', '5')
      .expect(422);
  });
  it('should return 200 if unsensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('about', 'this is my breif')
      .expect(200);
  });
  it('should return 422 if sensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('isOnline', 'true')
      .expect(422);
  });
  it('should return 200 if unsensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('isAvaliableToInstantProjects', 'true')
      .expect(200);
  });
  it('should return 200 if unsensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('pricePerHour', '20')
      .expect(200);
  });
  it('should return 422 if sensitive field', async () => {
    const planId = new mongoose.Types.ObjectId();
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('plan', planId.toString())
      .expect(422);
  });
  it('should return 422 if sensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('hasVerificationPadge', 'true')
      .expect(422);
  });
  it('should return 422 if sensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('avaliableContracts', 'true')
      .expect(422);
  });
  it('should return 422 if sensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('rate[ratesCounter]', '10')
      .field('rate[totalRates]', '10')
      .expect(422);
  });
  it('should return 422 if sensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('isBlocked', 'false')
      .expect(422);
  });
  it('should return 422 if sensitive field', async () => {
    await request
      .patch('/api/users/auth/profile')
      .set('Cookie', cookieSession)
      .set('Content-Type', 'multipart/form-data')
      .field('status', 'false')
      .expect(422);
  });
});
