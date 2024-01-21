import { config } from 'dotenv';

config({ path: '.env.local' });

export const env = {
  port: +(process.env.PORT || 3000) as number,
  environment: process.env.NODE_ENV || 'development',
  mongoDb: {
    uri: process.env.MONGO_URI as string,
  },
};

export const checkEnvVariables = () => {
  if (!env.mongoDb.uri) throw new Error('env:MONGO_URI must be defined');
};
