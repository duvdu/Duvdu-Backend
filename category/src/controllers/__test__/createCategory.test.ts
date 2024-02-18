import fs from 'fs';
import path from 'path';

import supertest from 'supertest';

import { app } from '../../app';

const request = supertest(app);


describe('create category should ' , ()=>{
  it('return 422 for invalid input' , async()=>{
    await request.post('/api/category')
      .send()
      .expect(422);
  });
  it('return 422 for invalid input' , async()=>{
    await request.post('/api/category')
      .send({
        title:''
      })
      .expect(422);
  });
  it('return 422 for invalid input' , async()=>{
    await request.post('/api/category')
      .send({
        title:'',
        image:'',
        cycle:0,
        tags:'',
        jobTitles:''
      })
      .expect(422);
  });

  it('should return 422 for invalid input as formdata' , async ()=>{
    await request.post('/api/category')
      .field('title' , 'catogey')
      .attach('image', fs.readFileSync(path.join(__dirname, 'image.jpg')), 'image.jpg')
      .field('cycle' , 1)
      .field('tags[0]' , 'cat1')
      .field('jobTitles[0]' ,'developer')
      .set('Content-Type', 'multipart/form-data')
      .expect(422);
      
  });
  it('should return 422 for invalid input as formdata' , async ()=>{
    await request.post('/api/category')
      .field('title.en' , 'catogey')
      .field('title.ar' , 'ةةةةةةة')
      .attach('image', fs.readFileSync(path.join(__dirname, 'image.jpg')), 'image.jpg')
      .field('cycle' , 1)
      .field('tags[0]' , 'cat1')
      .field('jobTitles[0]' ,'developer')
      .set('Content-Type', 'multipart/form-data')
      .expect(201);
      
  });
});