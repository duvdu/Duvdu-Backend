import fs from 'fs';
import path from 'path';

import aws from 'aws-sdk';

export class Bucket {
  private s3;
  constructor(
    private bucket: string,
    key: string,
    secret: string,
    region: string,
  ) {
    this.s3 = new aws.S3({
      accessKeyId: key,
      secretAccessKey: secret,
      region: region,
    });
  }

  async upload(folder: string, files: Express.Multer.File[]) {
    const uploadPromises = files.map((file) => {
      const fileStream = fs.createWriteStream(path.join(__dirname, `../../media/${file.filename}`));
      return this.s3
        .upload({ Bucket: this.bucket, Key: file.filename, Body: fileStream })
        .promise();
    });

    await Promise.all(uploadPromises);
  }

  async remove(...filePaths: string[]) {
    this.s3.deleteObjects(
      { Bucket: this.bucket, Delete: { Objects: filePaths.map((el) => ({ Key: el })) } },
      (err: Error) => {
        console.error(err);
        throw new Error(err.message);
      },
    );
  }
}
