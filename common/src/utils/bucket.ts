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

      const contentType = this.getContentType(file.filename);

      await new Promise((resolve, reject) => {
        this.s3.putObject(
          {
            Bucket: this.bucketName,
            Key: `${folder}/${file.filename}`,
            Body: fileStream,
            ContentDisposition: 'inline',
            ContentType: contentType,
            ACL: 'public-read'
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

  private getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    switch (ext) {
    // Video Types
    case '.mp4':
      return 'video/mp4';
    case '.webm':
      return 'video/webm';
    case '.ogg':
      return 'video/ogg';
    case '.avi':
      return 'video/x-msvideo';
    case '.mov':
      return 'video/quicktime';
    case '.wmv':
      return 'video/x-ms-wmv';
    case '.mkv':
      return 'video/x-matroska';
    case '.flv':
      return 'video/x-flv';
  
      // Audio Types
    case '.mp3':
      return 'audio/mpeg';
    case '.wav':
      return 'audio/wav';
    case '.aac':
      return 'audio/aac';
    case '.flac':
      return 'audio/flac';
    case '.m4a':
      return 'audio/x-m4a';
    case '.wma':
      return 'audio/x-ms-wma';
  
      // Image Types
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.bmp':
      return 'image/bmp';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.tiff':
    case '.tif':
      return 'image/tiff';
        
      // PDF and other document types
    case '.pdf':
      return 'application/pdf';
      
      // Default fallback
    default:
      return 'application/octet-stream'; // Fallback for unknown types
    }
  }

}


