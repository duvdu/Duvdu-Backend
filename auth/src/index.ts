import { dbConnection } from './../config/mongo-connection';
import { app } from './app';

const start = async () => {
  await dbConnection();
  app.listen(3000, () => console.log('auth listen on port 3000'));
};

start();
