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
  },
  expressSession:{
    secret: process.env.SESSION_SECRET as string,
  },
  redis:{
    redisHost:process.env.REDIS_HOST as string,
  }
};

export const checkEnvVariables = () => {
  console.log(process.env.REDIS_HOST);

  if (!env.mongoDb.uri) throw new Error('env:MONGO_URI must be defined');
  if (!env.jwt.secret) throw new Error('env:JWT_KEY must be defined');
  if (!env.google.client_id) throw new Error('env:CLIENT_ID must be defined');
  if (!env.google.client_secret) throw new Error('env:CLIENT_SECRET must be defined');
  if (!env.expressSession.secret) return new Error('env:SESSION_SECRET must be defined');
  if (!env.redis.redisHost) return new Error('env:REDIS_HOST must be defined');
};
