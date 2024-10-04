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
    pass: process.env.REDIS_PASS as string,
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
  if (!env.expressSession.secret) return new Error('env:SESSION_SECRET must be defined');
  if (!env.redis.uri) return new Error('env:REDIS_HOST must be defined');
  if (!env.redis.pass) return new Error('env:REDIS_PASS must be defined');
  if (!env.nats.clientId) return new Error('env:NATS_CLUSTER_ID must be defined');
  if (!env.nats.clusterId) return new Error('env:NATS_CLIENT_ID must be defined');
  if (!env.nats.url) return new Error('env:NATS_URL must be defined');
};
