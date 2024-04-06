import { RequestHandler } from 'express';
import fs from 'fs';
import path from 'path';
import { s3 } from '../config/s3';
import { env } from '../config/env';
import { BadRequestError } from '@duvdu-v1/duvdu';

export const saveBucketFiles = async (folder: string, ...files: Express.Multer.File[]) => {
  const uploadPromises = files.map((file) => {
    const fileStream = fs.createWriteStream(path.join(__dirname, `../../media/${file.filename}`));
    return s3.upload({ Bucket: env.aws.s3.name, Key: file.filename, Body: fileStream }).promise();
  });

  await Promise.all(uploadPromises);
};

export const removeBucketFiles = async (...filePaths: string[]) => {
  s3.deleteObjects(
    { Bucket: env.aws.s3.name, Delete: { Objects: filePaths.map((el) => ({ Key: el })) } },
    (err) => {
      console.error(err);
      throw new Error(err.message);
    },
  );
};

export const getBucketFileMiddleware: RequestHandler = async (req, res, next) =>
  s3
    .getObject({ Bucket: env.aws.s3.name, Key: res.locals.file_path }, (err) => {
      console.error(err);
    })
    .createReadStream()
    .pipe(res)
    .on('error', (err) => {
      console.error(err);
      return next(new BadRequestError(err.message));
    })
    .on('finish', () => res.status(200).end());
