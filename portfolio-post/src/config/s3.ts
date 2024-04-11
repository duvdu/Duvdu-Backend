import aws from 'aws-sdk';

import { env } from './env';

export const s3 = new aws.S3({
  accessKeyId: env.aws.s3.access,
  secretAccessKey: env.aws.s3.secret,
  region: env.aws.s3.region,
});
