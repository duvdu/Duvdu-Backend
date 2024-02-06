import mongoose from 'mongoose';
import supertest from 'supertest';

import { app } from '../../../app';
import { hashVerificationCode } from '../../../utils/crypto';

const request = supertest(app);

let cookieSession: string[];
beforeEach(async () => {
  const mongoId = new mongoose.Types.ObjectId().toHexString();
  await mongoose.connection.db.collection('role').insertOne({ id: mongoId, key: 'free' });
  await mongoose.connection.db.collection('plan').insertOne({ role: mongoId, key: 'free' });

  const response = await request.post('/api/users/signup').send({
    username: 'metoooo',
    password: '123@Metoo',
    name: 'mohamed elewasy',
    phoneNumber: { number: '01552159359' },
  });
  await mongoose.connection.db
    .collection('user')
    .updateOne({ username: 'metoooo' }, { $set: { isVerified: true } });
  cookieSession = response.get('Set-Cookie');
});

describe('verify update phone number' , ()=>{
  it('should return 422 for invalid input ', async() => {
    await request.post('/api/users/update-phone/verify')
      .send({})
      .expect(422);
  });
  it('should return 422 for invalid input ', async() => {
    await request.post('/api/users/update-phone/verify')
      .send({
        verificationCode:''
      })
      .expect(422);
  });
  it('should return 422 for invalid input ', async() => {
    await request.post('/api/users/update-phone/verify')
      .send({
        verificationCode:'',
        phoneNumber:'01022484942'
      })
      .expect(422);
  });
  it('should return 422 for invalid input ', async() => {
    await request.post('/api/users/update-phone/verify')
      .send({
        verificationCode:'123',
        phoneNumber:'01022484942'
      })
      .expect(422);
  });
  it('should return 422 for invalid input ', async() => {
    await request.post('/api/users/update-phone/verify')
      .send({
        verificationCode:'123456',
        phoneNumber:'01022484'
      })
      .expect(422);
  });
  it('should return 422 for invalid input ', async() => {
    await request.post('/api/users/update-phone/verify')
      .send({
        verificationCode:'',
        phoneNumber:'01022484942'
      })
      .expect(422);
  });
  it('should return 404 if user not found ', async() => {
    await request.post('/api/users/update-phone/verify')
      .send({
        verificationCode:'123456',
        phoneNumber:'01022484942'
      })
      .expect(404);
  });
  it('should return 200 for success response', async () => {
    const randomCode = hashVerificationCode('123456');
    await request.post('/api/users/update-phone')
      .set('Cookie' , cookieSession)
      .send({
        password:'123@Metoo'
      })
      .expect(200);

    await mongoose.connection.db.collection('user').updateOne(
      {username:'metoooo'},
      {$set:{verificationCode:{code:randomCode , expireAt:new Date(Date.now() + 60 * 1000).toString()}}}
    );

    await request.put('/api/users/update-phone')
      .set('Cookie' , cookieSession)
      .send({
        verificationCode:'123456',
        phoneNumber:'01022484942'
      })
      .expect(200);
    const user = await mongoose.connection.db.collection('user').findOne({username:'metoooo'});
    expect(user?.isBlocked).toBeTruthy();

    await mongoose.connection.db.collection('user').updateOne(
      {username:'metoooo'},
      {$set:{verificationCode:{code:randomCode , expireAt:new Date(Date.now() + 60 * 1000).toString()}}}
    );

    await request.post('/api/users/update-phone/verify')
      .send({
        verificationCode:'123456',
        phoneNumber:'01022484942'
      }).expect(200);
    const userTwo = await mongoose.connection.db.collection('user').findOne({username:'metoooo'});
    expect(userTwo?.isBlocked).toBeFalsy();
  });
});


