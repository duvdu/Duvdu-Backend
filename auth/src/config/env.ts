import { config } from 'dotenv';

config();

export const env = {
  port: +(process.env.PORT || 3000) as number,
  environment: process.env.NODE_ENV || 'development',
  mongoDb: {
    uri: process.env.MONGO_URI as string,
  },
  bcrypt: {
    salt: +(process.env.BCRYPT_SALT || 10) as number,
    paper: (process.env.BCRYPT_PAPER || 'password') as string,
  },
  jwt: {
    secret: process.env.JWT_KEY as string,
  },
  google:{
    client_id : process.env.CLIENT_ID,
    client_secret:process.env.CLIENT_SECRET
  }
};

export const checkEnvVariables = () => {
  if (!env.mongoDb.uri) throw new Error('env:MONGO_URI must be defined');
  if (!env.jwt.secret) throw new Error('env:JWT_KEY must be defined');
  if (!env.google.client_id) throw new Error('env:CLIENT_ID must be defined');
  if (!env.google.client_secret) throw new Error('env:CLIENT_SECRET must be defined');
};
