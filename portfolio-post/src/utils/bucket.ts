import fs from 'fs';
import path from 'path';

import { env } from '../config/env';
import { s3 } from '../config/s3';
import { FOLDERS } from '../types/folders';

export const saveBucketFiles = async (folder: string, ...files: Express.Multer.File[]) => {
  for (const file of files) {
    const fileStream = fs.createReadStream(
      path.join(__dirname, `../../media/${folder}/${file.filename}`),
    );
    await new Promise((resolve, reject) => {
      s3.putObject(
        {
          Bucket: env.aws.s3.name,
          Key: `${FOLDERS.portfolio_post}/${file.filename}`,
          Body: fileStream,
        },
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        },
      );
    });
    fileStream.close();
  }
};

export const removeBucketFiles = async (...filePaths: string[]) => {
  await new Promise((resolve, reject) => {
    s3.deleteObjects(
      { Bucket: env.aws.s3.name, Delete: { Objects: filePaths.map((el) => ({ Key: el })) } },
      (err, data) => {
        if (err) reject(err);
        else resolve(data);
      },
    );
  });
};
