import { connect } from 'mongoose';

import { env } from './env';

export const dbConnection = () => {
  return connect(env.mongoDb.url)
    .then((conn) => console.log(`databse connected in auth: ${conn.connection.host}`))
    .catch(() => {
      throw new Error('database connection error in auth');
    });
};
