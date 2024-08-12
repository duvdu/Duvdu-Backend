import { config } from 'dotenv';

config();

export const env = {
  port: +(process.env.PORT || 3000) as number,
  environment: process.env.NODE_ENV || 'development',
  mongoDb: {
    uri: process.env.MONGO_URI as string,
  },
  redis: {
    uri: process.env.REDIS_HOST as string,
    pass: process.env.REDIS_PASS as string,
  },
  bcrypt: {
    salt: +(process.env.BCRYPT_SALT || 10) as number,
    paper: (process.env.BCRYPT_PAPER || 'password') as string,
  },
  jwt: {
    secret: process.env.JWT_KEY as string,
  },
  google: {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  },
  expressSession: {
    secret: process.env.SESSION_SECRET as string,
    allowUseStorage: (process.env.ALLOW_USE_SESSION_STORAGE === 'true') as boolean,
  },
  nats: {
    clusterId: process.env.NATS_CLUSTER_ID,
    clientId: process.env.NATS_CLIENT_ID,
    url: process.env.NATS_URL,
  },
};

export const checkEnvVariables = () => {
  console.log(env.redis.uri);
  console.log(env.redis.pass);

  if (!env.mongoDb.uri) throw new Error('env:MONGO_URI must be defined');
  if (!env.jwt.secret) throw new Error('env:JWT_KEY must be defined');
  if (!env.google.client_id) throw new Error('env:CLIENT_ID must be defined');
  if (!env.google.client_secret) throw new Error('env:CLIENT_SECRET must be defined');
  if (!env.expressSession.secret) return new Error('env:SESSION_SECRET must be defined');
  if (!env.redis.uri) return new Error('env:REDIS_HOST must be defined');
  if (!env.redis.pass) return new Error('env:REDIS_PASS must be defined');
  console.log(env.redis.uri);
};
