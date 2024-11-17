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
    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks (AWS minimum)
    
    await Promise.all(
      files.map(async (file) => {
        const filePath = path.resolve(`media/${folder}/${file.filename}`);
        const fileSize = fs.statSync(filePath).size;
        const contentType = this.getContentType(file.filename);

        // Use regular upload for small files (less than 15MB)
        if (fileSize < CHUNK_SIZE * 3) {
          return this.uploadSmallFile(folder, file, contentType);
        }

        // Use multipart upload for large files
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
          const fileStream = fs.createReadStream(filePath, { highWaterMark: CHUNK_SIZE });
          
          let partNumber = 1;
          let buffer = Buffer.alloc(0);

          for await (const chunk of fileStream) {
            buffer = Buffer.concat([buffer, chunk]);
            
            // Upload when buffer reaches CHUNK_SIZE or it's the last chunk
            if (buffer.length >= CHUNK_SIZE || partNumber * CHUNK_SIZE >= fileSize) {
              const partData = await new Promise<aws.S3.UploadPartOutput>((resolve, reject) => {
                this.s3.uploadPart({
                  Bucket: this.bucketName,
                  Key: `${folder}/${file.filename}`,
                  PartNumber: partNumber,
                  UploadId: uploadId,
                  Body: buffer,
                }, (err, data) => {
                  if (err) reject(err);
                  else resolve(data);
                });
              });

              parts.push({
                PartNumber: partNumber,
                ETag: partData.ETag!
              });

              buffer = Buffer.alloc(0);
              partNumber++;
            }
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
                UploadId: multipartUpload!.UploadId!  // Add non-null assertion here
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
    const BATCH_SIZE = 1000; // AWS limit is 1000 objects per delete operation
    
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
      
      // Check if exactly one face is detected
      if (!result.FaceDetails || result.FaceDetails.length === 0) {
        return {
          isValid: false,
          error: {en: 'No face detected in the image', ar: 'لا يوجد وجه مكتشف في الصورة'}
        };
      }

      if (result.FaceDetails.length > 1) {
        return {
          isValid: false,
          error: {en: 'Multiple faces detected in the image', ar: 'تم الكشف عن أكثر من وجه ف�� الصورة'}
        };
      }

      const face = result.FaceDetails[0];

      // Stricter confidence threshold (95%)
      if (!face.Confidence || face.Confidence < 95) {
        return {
          isValid: false,
          error: {en: 'Image quality is not sufficient', ar: 'جودة الصورة غير كافية'}
        };
      }

      // Check for sunglasses or eyeglasses
      if (face.Sunglasses?.Value || face.Eyeglasses?.Value) {
        return {
          isValid: false,
          error: {en: 'Please remove glasses or sunglasses', ar: 'يرجى إزالة النظارات أو النظارات الشمسية'}
        };
      }

      // Check if eyes are open with higher confidence
      const leftEyeOpen = face.EyesOpen?.Value && (face.EyesOpen?.Confidence ?? 0) > 95;
      const rightEyeOpen = face.EyesOpen?.Value && (face.EyesOpen?.Confidence ?? 0) > 95;
      if (!leftEyeOpen || !rightEyeOpen) {
        return {
          isValid: false,
          error: {en: 'Eyes must be fully open and clearly visible', ar: 'يجب أن تكون العينين مفتوحتين بالكامل وواضحتين'}
        };
      }

      // Check for mouth open
      if (face.MouthOpen?.Value) {
        return {
          isValid: false,
          error: {en: 'Mouth should be closed', ar: 'يجب أن يكون الفم مغلقاً'}
        };
      }

      // Stricter face orientation check
      const pose = face.Pose;
      const poseThreshold = 15; // Stricter threshold (15 degrees)
      if (Math.abs(pose?.Pitch || 0) > poseThreshold || 
          Math.abs(pose?.Roll || 0) > poseThreshold || 
          Math.abs(pose?.Yaw || 0) > poseThreshold) {
        return {
          isValid: false,
          error: {en: 'Face must be directly facing the camera', ar: 'يجب أن يكون الوجه مواجهاً للكاميرا مباشرة'}
        };
      }

      // Check for facial occlusions
      if (face.FaceOccluded?.Value) {
        return {
          isValid: false,
          error: {en: 'Face must be fully visible without any coverings', ar: 'يجب أن يكون الوجه مرئياً بالكامل بدون أي أغطية'}
        };
      }
      // Check for neutral expression
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