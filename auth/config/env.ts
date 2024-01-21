import { config } from 'dotenv';

config({ path: '.env.local' });

export const env = {
  port: +(process.env.PORT || 3000) as number,
  environment: process.env.NODE_ENV || 'development',
  mongoDb: {
    url: process.env.MONGO_URL as string,
  },
};

export const checkEnvVariables = () => {
  if (!env.mongoDb.url) throw new Error('env:MONGO_URL must be defined');
};
