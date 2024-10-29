import fs from 'fs';
import path from 'path';

import aws from 'aws-sdk';

export class Bucket {
  private s3: aws.S3;
  private bucketName: string;
  constructor() {
    this.s3 = new aws.S3({
      accessKeyId: process.env.BUCKET_ACESS_KEY,
      secretAccessKey: process.env.BUCKET_SECRET_KEY,
      region: process.env.BUCKET_REGION,
    });
    this.bucketName = process.env.BUCKET_NAME as string;
  }

  async saveBucketFiles(folder: string, ...files: Express.Multer.File[]) {
    for (const file of files) {
      const fileStream = fs.createReadStream(path.resolve(`media/${folder}/${file.filename}`));
      await new Promise((resolve, reject) => {
        this.s3.putObject(
          {
            Bucket: this.bucketName,
            Key: `${folder}/${file.filename}`,
            Body: fileStream,
            ContentDisposition: 'inline',
          },
          (err, data) => {
            if (err) reject(err);
            else resolve(data);
          },
        );
      });
      fileStream.close();
    }
  }

  async removeBucketFiles(...filePaths: string[]) {
    await new Promise((resolve, reject) => {
      this.s3.deleteObjects(
        { Bucket: this.bucketName, Delete: { Objects: filePaths.map((el) => ({ Key: el })) } },
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        },
      );
    });
  }
}
