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
  expressSession: {
    secret: process.env.SESSION_SECRET as string,
    allowUseStorage: (process.env.ALLOW_USE_SESSION_STORAGE === 'true') as boolean,
  },
  redis: {
    uri: process.env.REDIS_HOST as string,
    pass: process.env.RESIS_PASS as string,
    port: process.env.RESIS_PORT ,
  },
};

export const checkEnvVariables = () => {
  console.log(process.env.JWT_KEY);
  if (!env.mongoDb.uri) throw new Error('env:MONGO_URI must be defined');
  if (!env.jwt.secret) throw new Error('env:JWT_KEY must be defined');
  if (!env.expressSession.secret) return new Error('env:SESSION_SECRET must be defined');
  if (!env.redis.uri) return new Error('env:REDIS_HOST must be defined');
  if (!env.redis.pass) return new Error('env:REDIS_PASS must be defined');
  if (!env.redis.port) return new Error('env:REDIS_PORT must be defined');
};
