import fs from 'fs';
import path from 'path';

import aws from 'aws-sdk';

export class Bucket {
  private s3: aws.S3;
  private bucketName: string;
  private rekognition: aws.Rekognition;

  constructor() {
    this.s3 = new aws.S3({
      accessKeyId: process.env.BUCKET_ACESS_KEY,
      secretAccessKey: process.env.BUCKET_SECRET_KEY,
      region: process.env.BUCKET_REGION,
    });
    this.bucketName = process.env.BUCKET_NAME as string;
    this.rekognition = new aws.Rekognition({
      accessKeyId: process.env.BUCKET_ACESS_KEY,
      secretAccessKey: process.env.BUCKET_SECRET_KEY,
      region: process.env.BUCKET_REGION,
    });
  }

  async saveBucketFiles(folder: string, ...files: Express.Multer.File[]) {
    const CHUNK_SIZE = 20 * 1024 * 1024; // 20MB chunks for better performance
    const MAX_PARALLEL_CHUNKS = 4; // Control parallel uploads
    
    await Promise.all(
      files.map(async (file) => {
        const filePath = path.resolve(`media/${folder}/${file.filename}`);
        const fileSize = fs.statSync(filePath).size;
        const contentType = this.getContentType(file.filename);

        if (fileSize < CHUNK_SIZE) {
          return this.uploadSmallFile(folder, file, contentType);
        }

        let multipartUpload: aws.S3.CreateMultipartUploadOutput | undefined;
        try {
          // Initiate multipart upload
          multipartUpload = await new Promise<aws.S3.CreateMultipartUploadOutput>((resolve, reject) => {
            this.s3.createMultipartUpload({
              Bucket: this.bucketName,
              Key: `${folder}/${file.filename}`,
              ContentType: contentType,
              ContentDisposition: 'inline',
              ServerSideEncryption: 'AES256',
            }, (err, data) => {
              if (err) reject(err);
              else resolve(data);
            });
          });

          const uploadId = multipartUpload.UploadId!;
          const parts: aws.S3.CompletedPart[] = [];
          const fileStream = fs.createReadStream(filePath);
          
          // Prepare chunks for parallel upload
          const chunks: Buffer[] = [];
          let currentChunk = Buffer.alloc(0);
          
          for await (const chunk of fileStream) {
            currentChunk = Buffer.concat([currentChunk, chunk]);
            if (currentChunk.length >= CHUNK_SIZE) {
              chunks.push(Buffer.from(currentChunk));
              currentChunk = Buffer.alloc(0);
            }
          }
          if (currentChunk.length > 0) {
            chunks.push(Buffer.from(currentChunk));
          }

          // Upload chunks in parallel batches
          for (let i = 0; i < chunks.length; i += MAX_PARALLEL_CHUNKS) {
            const batch = chunks.slice(i, i + MAX_PARALLEL_CHUNKS);
            const partUploads = batch.map((chunkBuffer, index) => {
              const partNumber = i + index + 1;
              return new Promise<aws.S3.CompletedPart>((resolve, reject) => {
                this.s3.uploadPart({
                  Bucket: this.bucketName,
                  Key: `${folder}/${file.filename}`,
                  PartNumber: partNumber,
                  UploadId: uploadId,
                  Body: chunkBuffer,
                }, (err, data) => {
                  if (err) reject(err);
                  else resolve({
                    PartNumber: partNumber,
                    ETag: data.ETag!
                  });
                });
              });
            });

            const completedParts = await Promise.all(partUploads);
            parts.push(...completedParts.sort((a, b) => (a.PartNumber ?? 0) - (b.PartNumber ?? 0)));
          }

          // Complete multipart upload
          await new Promise((resolve, reject) => {
            this.s3.completeMultipartUpload({
              Bucket: this.bucketName,
              Key: `${folder}/${file.filename}`,
              UploadId: uploadId,
              MultipartUpload: { Parts: parts }
            }, (err, data) => {
              if (err) reject(err);
              else resolve(data);
            });
          });

        } catch (error) {
          // Attempt to abort multipart upload if it fails
          if (multipartUpload?.UploadId) {
            await new Promise((resolve) => {
              this.s3.abortMultipartUpload({
                Bucket: this.bucketName,
                Key: `${folder}/${file.filename}`,
                UploadId: multipartUpload!.UploadId!
              }, () => resolve(null));
            });
          }
          throw error;
        }
      })
    );
  }

  private async uploadSmallFile(folder: string, file: Express.Multer.File, contentType: string) {
    const fileStream = fs.createReadStream(path.resolve(`media/${folder}/${file.filename}`));
    try {
      await new Promise((resolve, reject) => {
        this.s3.putObject({
          Bucket: this.bucketName,
          Key: `${folder}/${file.filename}`,
          Body: fileStream,
          ContentDisposition: 'inline',
          ContentType: contentType,
          ServerSideEncryption: 'AES256',
        }, (err, data) => {
          fileStream.destroy();
          if (err) reject(err);
          else resolve(data);
        });
      });
    } catch (error) {
      fileStream.destroy();
      throw error;
    }
  }

  async removeBucketFiles(...filePaths: string[]) {
    const BATCH_SIZE = 1000;
    
    for (let i = 0; i < filePaths.length; i += BATCH_SIZE) {
      const batch = filePaths.slice(i, i + BATCH_SIZE);
      await new Promise((resolve, reject) => {
        this.s3.deleteObjects(
          {
            Bucket: this.bucketName,
            Delete: { Objects: batch.map((el) => ({ Key: el })) }
          },
          (err, data) => {
            if (err) reject(err);
            else resolve(data);
          },
        );
      });
    }
  }

  private getContentType(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    
    for (const category of Object.values(MIME_TYPES)) {
      if (ext in category) {
        return category[ext as keyof typeof category];
      }
    }
    
    return 'application/octet-stream';
  }

  async validateFace(imageKey: string): Promise<{ 
    isValid: boolean; 
    error?: { en: string; ar: string };
  }> {
    try {
      const params = {
        Image: {
          S3Object: {
            Bucket: this.bucketName,
            Name: imageKey
          }
        },
        Attributes: ['ALL']
      };

      const result = await this.rekognition.detectFaces(params).promise();
      
      if (!result.FaceDetails || result.FaceDetails.length === 0) {
        return {
          isValid: false,
          error: {en: 'No face detected in the image', ar: 'لا يوجد وجه مكتشف في الصورة'}
        };
      }

      if (result.FaceDetails.length > 1) {
        return {
          isValid: false,
          error: {en: 'Multiple faces detected in the image', ar: 'تم الكشف عن أكثر من وجه في الصورة'}
        };
      }

      const face = result.FaceDetails[0];

      if (!face.Confidence || face.Confidence < 95) {
        return {
          isValid: false,
          error: {en: 'Image quality is not sufficient', ar: 'جودة الصورة غير كافية'}
        };
      }

      if (face.Sunglasses?.Value || face.Eyeglasses?.Value) {
        return {
          isValid: false,
          error: {en: 'Please remove glasses or sunglasses', ar: 'يرجى إزالة النظارات أو النظارات الشمسية'}
        };
      }

      const leftEyeOpen = face.EyesOpen?.Value && (face.EyesOpen?.Confidence ?? 0) > 95;
      const rightEyeOpen = face.EyesOpen?.Value && (face.EyesOpen?.Confidence ?? 0) > 95;
      if (!leftEyeOpen || !rightEyeOpen) {
        return {
          isValid: false,
          error: {en: 'Eyes must be fully open and clearly visible', ar: 'يجب أن تكون العينين مفتوحتين بالكامل وواضحتين'}
        };
      }

      if (face.MouthOpen?.Value) {
        return {
          isValid: false,
          error: {en: 'Mouth should be closed', ar: 'يجب أن يكون الفم مغلقاً'}
        };
      }

      const pose = face.Pose;
      const poseThreshold = 15;
      if (Math.abs(pose?.Pitch || 0) > poseThreshold || 
          Math.abs(pose?.Roll || 0) > poseThreshold || 
          Math.abs(pose?.Yaw || 0) > poseThreshold) {
        return {
          isValid: false,
          error: {en: 'Face must be directly facing the camera', ar: 'يجب أن يكون الوجه مواجهاً للكاميرا مباشرة'}
        };
      }

      if (face.FaceOccluded?.Value) {
        return {
          isValid: false,
          error: {en: 'Face must be fully visible without any coverings', ar: 'يجب أن يكون الوجه مرئياً بالكامل بدون أي أغطية'}
        };
      }

      if (face.Smile?.Value) {
        return {
          isValid: false,
          error: {en: 'Please maintain a neutral expression (no smiling)', ar: 'يرجى الحفاظ على تعبير محايد (بدون ابتسامة)'}
        };
      }

      return { isValid: true };

    } catch (error) {
      console.error('Error validating face:', error);
      return {
        isValid: false,
        error: {en: 'Error processing image', ar: 'خطأ في معالجة الصورة'}
      };
    }
  }
}

const MIME_TYPES = {
  video: {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.wmv': 'video/x-ms-wmv',
    '.mkv': 'video/x-matroska',
    '.flv': 'video/x-flv'
  },
  audio: {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.aac': 'audio/aac',
    '.flac': 'audio/flac',
    '.m4a': 'audio/x-m4a',
    '.wma': 'audio/x-ms-wma'
  },
  image: {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff'
  },
  document: {
    '.pdf': 'application/pdf'
  }
} as const;