import supertest from 'supertest';

import { app } from '../../app';

const request = supertest(app);

describe('resetPassword' , ()=>{
  it('should return 422 for invalid input', async () => {
    await request.patch('/api/users/reset-password')
      .send({})
      .expect(422);

    await request.patch('/api/users/reset-password')
      .send({username:''})
      .expect(422);

    await request.patch('/api/users/reset-password')
      .send({username:'metoo'})
      .expect(422);

    await request.patch('/api/users/reset-password')
      .send({
        username:'motemedkhaled',
        verificationCode:''
      })
      .expect(422);

    await request.patch('/api/users/reset-password')
      .send({
        username:'motemedkhaled',
        verificationCode:'123456'
      })
      .expect(422);

    await request.patch('/api/users/reset-password')
      .send({
        username:'motemedkhaled',
        verificationCode:'123456',
        newPassword:''
      })
      .expect(422);

    await request.patch('/api/users/reset-password')
      .send({
        username:'motemedkhaled',
        verificationCode:'123456',
        newPassword:'123'
      })
      .expect(422);
  });
  it('should return 404 if user not found', async () => {
    await request.patch('/api/users/reset-password')
      .send({
        username:'metoooo',
        verificationCode:'123456',
        newPassword:'123@Metoo'
      })
      .expect(404);
  });
  it('should return 401 if invalid verification code', async () => {
    await request.post('/api/users/signup')
      .send({
        name:'motemed khaled',
        phoneNumber:{
          number:'01022484942'
        },
        username:'motemedKhaled',
        password:'123@Metoo'
      }).expect(201);

    await request.patch('/api/users/reset-password')
      .send({
        username:'motemedKhaled',
        verificationCode:'123456',
        newPassword:'123@Metoo'
      }).expect(401);
  });
});