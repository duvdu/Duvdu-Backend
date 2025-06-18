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
    queue: process.env.REDIS_QUEUE as string,
  },
  expressSession: {
    secret: process.env.SESSION_SECRET as string,
    allowUseStorage: (process.env.ALLOW_USE_SESSION_STORAGE === 'true') as boolean,
  },
  jwt: { secret: process.env.JWT_KEY as string },
  aws: {
    s3: {
      access: process.env.BUCKET_ACESS_KEY as string,
      secret: process.env.BUCKET_SECRET_KEY as string,
      name: process.env.BUCKET_NAME as string,
      region: process.env.BUCKET_REGION as string,
      host: process.env.BUCKET_HOST as string,
    },
  },
  nats: {
    clusterId: process.env.NATS_CLUSTER_ID,
    clientId: process.env.NATS_CLIENT_ID,
    url: process.env.NATS_URL,
  },
  paymob: {
    apiKey: process.env.PAYMOB_API_KEY,
    integrationId: process.env.PAYMOB_INTEGRATION_ID,
    iframeId: process.env.PAYMOB_IFRAME_ID,
    hmacSecret: process.env.PAYMOB_HMAC_SECRET,
    baseUrl: process.env.PAYMOB_BASE_URL,
  },
};

export const checkEnvVariables = () => {
  console.log(env.redis.uri);
  console.log(env.redis.pass);

  if (!env.mongoDb.uri) throw new Error('env:MONGO_URI must be defined');
  if (!env.expressSession.secret) return new Error('env:SESSION_SECRET must be defined');
  if (!env.redis.uri) return new Error('env:REDIS_HOST must be defined');
  if (!env.redis.pass) return new Error('env:REDIS_PASS must be defined');
  if (!env.jwt.secret) return new Error('env:JWT_KEY must be defined');
  if (!env.aws.s3.access) return new Error('env:BUCKET_ACESS_KEY must be defined');
  if (!env.aws.s3.secret) return new Error('env:BUCKET_SECRET_KEY must be defined');
  if (!env.aws.s3.name) return new Error('env:BUCKET_NAME must be defined');
  if (!env.aws.s3.region) return new Error('env:BUCKET_REGION must be defined');
  if (!env.aws.s3.host) return new Error('env:BUCKET_HOST must be defined');
  if (!env.paymob.apiKey) return new Error('env:PAYMOB_API_KEY must be defined');
  if (!env.paymob.integrationId) return new Error('env:PAYMOB_INTEGRATION_ID must be defined');
  if (!env.paymob.iframeId) return new Error('env:PAYMOB_IFRAME_ID must be defined');
  if (!env.paymob.hmacSecret) return new Error('env:PAYMOB_HMAC_SECRET must be defined');
  if (!env.paymob.baseUrl) return new Error('env:PAYMOB_BASE_URL must be defined');
};
