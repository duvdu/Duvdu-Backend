import supertest from 'supertest';

import { app } from '../../app';

const request = supertest(app);

describe('askResetPassword' , ()=>{
  it('should return 422 for invalid input', async() => {
    await request.post('/api/users/ask-reset-password')
      .send({})
      .expect(422);

    await request.post('/api/users/ask-reset-password')
      .send({username:''})
      .expect(422);

    await request.post('/api/users/ask-reset-password')
      .send({username:'metoo'})
      .expect(422);
  });
  it('should return 404 if user not found', async () => {
    await request.post('/api/users/ask-reset-password')
      .send({username:'metoooo'})
      .expect(404);
  });
  it('should return 200 for success', async () => {
    await request.post('/api/users/signup')
      .send({
        name:'motemed khaled',
        phoneNumber:{
          number:'01022484942'
        },
        username:'motemedKhaled',
        password:'123@Metoo'
      }).expect(201);

    await request.post('/api/users/ask-reset-password')
      .send({username:'motemedKhaled'})
      .expect(200);
  });
});