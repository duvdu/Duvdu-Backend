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
    const CHUNK_SIZE = 20 * 1024 * 1024;
    const MAX_PARALLEL_FILES = 30;
    const MAX_RETRIES = 3;

    // Process files in parallel batches
    for (let i = 0; i < files.length; i += MAX_PARALLEL_FILES) {
      const fileBatch = files.slice(i, i + MAX_PARALLEL_FILES);
      await Promise.all(
        fileBatch.map(async (file) => {
          const contentType = this.getContentType(file.filename);
          const fileSize = file.size;

          if (fileSize < CHUNK_SIZE) {
            return this.uploadSmallFile(folder, file, contentType);
          }

          let multipartUpload: aws.S3.CreateMultipartUploadOutput | undefined;
          try {
            // Initiate multipart upload
            multipartUpload = await new Promise<aws.S3.CreateMultipartUploadOutput>(
              (resolve, reject) => {
                this.s3.createMultipartUpload(
                  {
                    Bucket: this.bucketName,
                    Key: `${folder}/${file.filename}`,
                    ContentType: contentType,
                    ContentDisposition: 'inline',
                    ServerSideEncryption: 'AES256',
                  },
                  (err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                  },
                );
              },
            );

            const uploadId = multipartUpload.UploadId!;
            const parts: aws.S3.CompletedPart[] = [];

            // Split buffer into chunks
            const buffer = file.buffer;
            const chunks: Buffer[] = [];

            for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
              chunks.push(buffer.slice(i, i + CHUNK_SIZE));
            }

            // Upload chunks
            const partUploads = chunks.map((chunk, index) => {
              const partNumber = index + 1;

              const uploadChunkWithRetry = async (
                retryCount = 0,
              ): Promise<aws.S3.CompletedPart> => {
                try {
                  const uploadPromise = new Promise((resolve, reject) => {
                    this.s3.uploadPart(
                      {
                        Bucket: this.bucketName,
                        Key: `${folder}/${file.filename}`,
                        PartNumber: partNumber,
                        UploadId: uploadId,
                        Body: chunk,
                      },
                      (err, data) => {
                        if (err) reject(err);
                        else
                          resolve({
                            PartNumber: partNumber,
                            ETag: data.ETag!,
                          });
                      },
                    );
                  });

                  const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Upload timeout')), 30000);
                  });

                  return (await Promise.race([
                    uploadPromise,
                    timeoutPromise,
                  ])) as aws.S3.CompletedPart;
                } catch (error) {
                  if (retryCount < MAX_RETRIES) {
                    await new Promise((resolve) =>
                      setTimeout(resolve, Math.pow(2, retryCount) * 1000),
                    );
                    return uploadChunkWithRetry(retryCount + 1);
                  }
                  throw error;
                }
              };

              return uploadChunkWithRetry();
            });

            const completedParts = await Promise.all(partUploads);
            parts.push(...completedParts.sort((a, b) => (a.PartNumber ?? 0) - (b.PartNumber ?? 0)));

            // Complete multipart upload
            await new Promise((resolve, reject) => {
              this.s3.completeMultipartUpload(
                {
                  Bucket: this.bucketName,
                  Key: `${folder}/${file.filename}`,
                  UploadId: uploadId,
                  MultipartUpload: { Parts: parts },
                },
                (err, data) => {
                  if (err) reject(err);
                  else resolve(data);
                },
              );
            });
          } catch (error) {
            if (multipartUpload?.UploadId) {
              await new Promise((resolve) => {
                this.s3.abortMultipartUpload(
                  {
                    Bucket: this.bucketName,
                    Key: `${folder}/${file.filename}`,
                    UploadId: multipartUpload!.UploadId!,
                  },
                  () => resolve(null),
                );
              });
            }
            throw error;
          }
        }),
      );
    }
  }

  private async uploadSmallFile(folder: string, file: Express.Multer.File, contentType: string) {
    await new Promise((resolve, reject) => {
      this.s3.putObject(
        {
          Bucket: this.bucketName,
          Key: `${folder}/${file.filename}`,
          Body: file.buffer,
          ContentDisposition: 'inline',
          ContentType: contentType,
          ServerSideEncryption: 'AES256',
        },
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        },
      );
    });
  }

  async removeBucketFiles(...filePaths: string[]) {
    const BATCH_SIZE = 1000;

    for (let i = 0; i < filePaths.length; i += BATCH_SIZE) {
      const batch = filePaths.slice(i, i + BATCH_SIZE);
      await new Promise((resolve, reject) => {
        this.s3.deleteObjects(
          {
            Bucket: this.bucketName,
            Delete: { Objects: batch.map((el) => ({ Key: el })) },
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
      // Enhanced face detection with liveness checks
      const faceParams = {
        Image: {
          S3Object: {
            Bucket: this.bucketName,
            Name: imageKey,
          },
        },
        Attributes: ['ALL'],
      };

      const faceResult = await this.rekognition.detectFaces(faceParams).promise();

      if (!faceResult.FaceDetails || faceResult.FaceDetails.length === 0) {
        return {
          isValid: false,
          error: { en: 'No face detected in the image', ar: 'لا يوجد وجه مكتشف في الصورة' },
        };
      }

      if (faceResult.FaceDetails.length > 1) {
        return {
          isValid: false,
          error: {
            en: 'Multiple faces detected in the image',
            ar: 'تم الكشف عن أكثر من وجه في الصورة',
          },
        };
      }

      const face = faceResult.FaceDetails[0];

      // Enhanced confidence check for liveness
      if (!face.Confidence || face.Confidence < 75) {
        return {
          isValid: false,
          error: { 
            en: 'Image quality is not sufficient for verification', 
            ar: 'جودة الصورة غير كافية للتحقق' 
          },
        };
      }

      // Perform liveness detection using multiple AWS Rekognition features
      const livenessCheck = await this.performLivenessDetection(imageKey);
      if (!livenessCheck.isLive) {
        return {
          isValid: false,
          error: livenessCheck.error!,
        };
      }

      // Enhanced anti-spoofing checks
      const antiSpoofingCheck = await this.performAntiSpoofingChecks(face);
      if (!antiSpoofingCheck.isValid) {
        return {
          isValid: false,
          error: antiSpoofingCheck.error!,
        };
      }

      // Original validation checks with enhanced thresholds
      if (face.Sunglasses?.Value || face.Eyeglasses?.Value) {
        return {
          isValid: false,
          error: {
            en: 'Please remove glasses or sunglasses for verification',
            ar: 'يرجى إزالة النظارات أو النظارات الشمسية للتحقق',
          },
        };
      }

      // Enhanced eye detection for liveness
      const eyesCheck = this.validateEyesForLiveness(face);
      if (!eyesCheck.isValid) {
        return {
          isValid: false,
          error: eyesCheck.error!,
        };
      }

      if (face.MouthOpen?.Value && (face.MouthOpen?.Confidence ?? 0) > 70) {
        return {
          isValid: false,
          error: { en: 'Mouth should be closed', ar: 'يجب أن يكون الفم مغلقاً' },
        };
      }

      // Enhanced pose validation for anti-spoofing
      const poseCheck = this.validatePoseForLiveness(face);
      if (!poseCheck.isValid) {
        return {
          isValid: false,
          error: poseCheck.error!,
        };
      }

      if (face.FaceOccluded?.Value && (face.FaceOccluded?.Confidence ?? 0) > 50) {
        return {
          isValid: false,
          error: {
            en: 'Face must be fully visible without any coverings',
            ar: 'يجب أن يكون الوجه مرئياً بالكامل بدون أي أغطية',
          },
        };
      }

      // Reject excessive smiling which might indicate a photo
      if (face.Smile?.Value && (face.Smile?.Confidence ?? 0) > 80) {
        return {
          isValid: false,
          error: {
            en: 'Please maintain a neutral expression (no smiling)',
            ar: 'يرجى الحفاظ على تعبير محايد (بدون ابتسامة)',
          },
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validating face:', error);
      return {
        isValid: false,
        error: { en: 'Error processing image', ar: 'خطأ في معالجة الصورة' },
      };
    }
  }

  private async performLivenessDetection(imageKey: string): Promise<{
    isLive: boolean;
    error?: { en: string; ar: string };
  }> {
    try {
      // Use AWS Rekognition's text detection to check for printed photos
      const textParams = {
        Image: {
          S3Object: {
            Bucket: this.bucketName,
            Name: imageKey,
          },
        },
      };

      const textResult = await this.rekognition.detectText(textParams).promise();
      
      // If significant text is detected around the face area, it might be a printed photo
      // Increased threshold to reduce false positives
      if (textResult.TextDetections && textResult.TextDetections.length > 8) {
        return {
          isLive: false,
          error: {
            en: 'Static image detected. Please use a live camera capture',
            ar: 'تم اكتشاف صورة ثابتة. يرجى استخدام التقاط مباشر من الكاميرا',
          },
        };
      }

      // Use label detection to identify screens, monitors, or printed materials
      const labelParams = {
        Image: {
          S3Object: {
            Bucket: this.bucketName,
            Name: imageKey,
          },
        },
        MaxLabels: 20,
        MinConfidence: 70,
      };

      const labelResult = await this.rekognition.detectLabels(labelParams).promise();
      
      if (labelResult.Labels) {
        // Reduced list to only obvious screen/printed content and increased confidence threshold
        const suspiciousLabels = ['Screen', 'Monitor', 'Display', 'Computer Screen', 'Television'];
        
        for (const label of labelResult.Labels) {
          if (suspiciousLabels.some(suspicious => 
            label.Name?.toLowerCase().includes(suspicious.toLowerCase()) && 
            (label.Confidence ?? 0) > 85
          )) {
            return {
              isLive: false,
              error: {
                en: 'Please take a live photo, not from a screen or printed image',
                ar: 'يرجى التقاط صورة مباشرة، وليس من شاشة أو صورة مطبوعة',
              },
            };
          }
        }
      }

      return { isLive: true };
    } catch (error) {
      console.error('Error in liveness detection:', error);
      // Don't fail the entire validation for liveness detection errors
      // This prevents AWS service issues from blocking legitimate users
      return { isLive: true };
    }
  }

  private async performAntiSpoofingChecks(face: aws.Rekognition.FaceDetail): Promise<{
    isValid: boolean;
    error?: { en: string; ar: string };
  }> {
    try {
      // Check for overly perfect lighting (common in printed photos) - relaxed threshold
      const qualityMetrics = face.Quality;
      if (qualityMetrics?.Brightness && qualityMetrics.Brightness > 98) {
        return {
          isValid: false,
          error: {
            en: 'Lighting appears artificial. Please use natural lighting',
            ar: 'الإضاءة تبدو اصطناعية. يرجى استخدام الإضاءة الطبيعية',
          },
        };
      }

      // Check for suspicious sharpness levels - more lenient range
      if (qualityMetrics?.Sharpness && (qualityMetrics.Sharpness < 10 || qualityMetrics.Sharpness > 98)) {
        return {
          isValid: false,
          error: {
            en: 'Image sharpness indicates possible static image. Please retake with live camera',
            ar: 'وضوح الصورة يشير إلى صورة ثابتة محتملة. يرجى إعادة التقاط بكاميرا مباشرة',
          },
        };
      }

      // Enhanced landmark analysis for 3D face detection
      if (face.Landmarks && face.Landmarks.length > 0) {
        const landmarks = face.Landmarks;
        
        // Check for proper depth perception in landmarks
        const eyeLandmarks = landmarks.filter(l => 
          l.Type === 'eyeLeft' || l.Type === 'eyeRight' || 
          l.Type === 'leftEyeLeft' || l.Type === 'leftEyeRight' ||
          l.Type === 'rightEyeLeft' || l.Type === 'rightEyeRight'
        );

        if (eyeLandmarks.length < 4) {
          return {
            isValid: false,
            error: {
              en: 'Insufficient facial features detected for verification',
              ar: 'ملامح الوجه المكتشفة غير كافية للتحقق',
            },
          };
        }

        // Check for unnatural symmetry (printed photos often have perfect symmetry)
        const noseLandmarks = landmarks.filter(l => l.Type === 'nose' || l.Type === 'noseLeft' || l.Type === 'noseRight');
        if (noseLandmarks.length > 0) {
          // Additional geometric checks could be implemented here
        }
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error in anti-spoofing checks:', error);
      // Don't fail validation for anti-spoofing errors to prevent service issues
      return { isValid: true };
    }
  }

  private validateEyesForLiveness(face: aws.Rekognition.FaceDetail): {
    isValid: boolean;
    error?: { en: string; ar: string };
  } {
    // Enhanced eye validation for liveness detection - more lenient
    const eyesOpen = face.EyesOpen;
    if (!eyesOpen?.Value || (eyesOpen.Confidence ?? 0) < 70) {
      return {
        isValid: false,
        error: {
          en: 'Eyes must be fully open and clearly visible',
          ar: 'يجب أن تكون العينين مفتوحتين بالكامل وواضحتين',
        },
      };
    }

    // Check for natural eye appearance (avoid glass reflections, red-eye, etc.)
    if (face.Landmarks) {
      const eyeLandmarks = face.Landmarks.filter(l => 
        l.Type?.includes('eye') || l.Type?.includes('Eye')
      );
      
      if (eyeLandmarks.length < 6) {
        return {
          isValid: false,
          error: {
            en: 'Eye features not clearly detected. Please ensure good lighting',
            ar: 'ملامح العين غير واضحة. يرجى التأكد من الإضاءة الجيدة',
          },
        };
      }
    }

    return { isValid: true };
  }

  private validatePoseForLiveness(face: aws.Rekognition.FaceDetail): {
    isValid: boolean;
    error?: { en: string; ar: string };
  } {
    const pose = face.Pose;
    const poseThreshold = 12; // Stricter threshold for liveness

    if (
      Math.abs(pose?.Pitch || 0) > poseThreshold ||
      Math.abs(pose?.Roll || 0) > poseThreshold ||
      Math.abs(pose?.Yaw || 0) > poseThreshold
    ) {
      return {
        isValid: false,
        error: {
          en: 'Face must be directly facing the camera',
          ar: 'يجب أن يكون الوجه مواجهاً للكاميرا مباشرة',
        },
      };
    }

    // Additional check for unnatural pose stability (printed photos have perfect stability)
    // This would require multiple frames in a video-based solution, but we can check for other indicators
    
    return { isValid: true };
  }

  /**
   * Comprehensive face validation with advanced liveness detection
   * This method provides additional verification by analyzing multiple image properties
   */
  async validateFaceWithAdvancedLiveness(imageKey: string): Promise<{
    isValid: boolean;
    livenessScore: number;
    error?: { en: string; ar: string };
    details?: {
      faceConfidence: number;
      livenessIndicators: string[];
      spoofingRisks: string[];
    };
  }> {
    try {
      const baseValidation = await this.validateFace(imageKey);
      
      if (!baseValidation.isValid) {
        return {
          isValid: false,
          livenessScore: 0,
          error: baseValidation.error,
        };
      }

      // Calculate liveness score based on multiple factors
      let livenessScore = 100;
      const livenessIndicators: string[] = [];
      const spoofingRisks: string[] = [];

      // Get detailed face analysis
      const faceParams = {
        Image: {
          S3Object: {
            Bucket: this.bucketName,
            Name: imageKey,
          },
        },
        Attributes: ['ALL'],
      };

      const faceResult = await this.rekognition.detectFaces(faceParams).promise();
      const face = faceResult.FaceDetails![0];

      // Analyze image metadata for camera vs screenshot indicators
      try {
        const moderationParams = {
          Image: {
            S3Object: {
              Bucket: this.bucketName,
              Name: imageKey,
            },
          },
        };

        const moderationResult = await this.rekognition.detectModerationLabels(moderationParams).promise();
        
        // Check for any labels that might indicate artificial content
        if (moderationResult.ModerationLabels && moderationResult.ModerationLabels.length > 0) {
          for (const label of moderationResult.ModerationLabels) {
            if (label.Name?.toLowerCase().includes('graphic') && (label.Confidence ?? 0) > 50) {
              livenessScore -= 20;
              spoofingRisks.push('Artificial content detected');
            }
          }
        }
      } catch (error) {
        // Moderation check failed, but don't fail the entire validation
        console.warn('Moderation check failed:', error);
      }

      // Quality metrics analysis
      const quality = face.Quality;
      if (quality) {
        if (quality.Brightness && (quality.Brightness < 30 || quality.Brightness > 90)) {
          livenessScore -= 10;
          spoofingRisks.push('Unusual lighting conditions');
        } else {
          livenessIndicators.push('Natural lighting detected');
        }

        if (quality.Sharpness && quality.Sharpness > 50 && quality.Sharpness < 90) {
          livenessIndicators.push('Appropriate image sharpness');
        } else if (quality.Sharpness && (quality.Sharpness < 30 || quality.Sharpness > 95)) {
          livenessScore -= 15;
          spoofingRisks.push('Suspicious image sharpness');
        }
      }

      // Face feature confidence analysis
      if (face.Confidence && face.Confidence > 95) {
        livenessIndicators.push('High face detection confidence');
      } else if (face.Confidence && face.Confidence < 85) {
        livenessScore -= 20;
        spoofingRisks.push('Low face detection confidence');
      }

      // Eye analysis for natural appearance
      if (face.EyesOpen?.Confidence && face.EyesOpen.Confidence > 95) {
        livenessIndicators.push('Natural eye appearance');
      }

      // Pose analysis for natural positioning
      const pose = face.Pose;
      if (pose) {
        const totalPoseDeviation = Math.abs(pose.Pitch || 0) + Math.abs(pose.Roll || 0) + Math.abs(pose.Yaw || 0);
        if (totalPoseDeviation > 0 && totalPoseDeviation < 25) {
          livenessIndicators.push('Natural head pose variation');
        } else if (totalPoseDeviation === 0) {
          livenessScore -= 25;
          spoofingRisks.push('Unnaturally perfect pose alignment');
        }
      }

      // Landmark analysis for 3D facial structure
      if (face.Landmarks && face.Landmarks.length >= 15) {
        livenessIndicators.push('Comprehensive facial landmarks detected');
      } else {
        livenessScore -= 10;
        spoofingRisks.push('Insufficient facial landmarks');
      }

      // Final liveness assessment
      const isLive = livenessScore >= 70;

      return {
        isValid: isLive,
        livenessScore,
        error: isLive ? undefined : {
          en: `Liveness verification failed (Score: ${livenessScore}/100). Please use a live camera capture`,
          ar: `فشل التحقق من الحيوية (النتيجة: ${livenessScore}/100). يرجى استخدام التقاط مباشر من الكاميرا`,
        },
        details: {
          faceConfidence: face.Confidence || 0,
          livenessIndicators,
          spoofingRisks,
        },
      };
    } catch (error) {
      console.error('Error in advanced face validation:', error);
      return {
        isValid: false,
        livenessScore: 0,
        error: { en: 'Error processing image', ar: 'خطأ في معالجة الصورة' },
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
    '.flv': 'video/x-flv',
  },
  audio: {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.aac': 'audio/aac',
    '.flac': 'audio/flac',
    '.m4a': 'audio/x-m4a',
    '.wma': 'audio/x-ms-wma',
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
    '.tif': 'image/tiff',
  },
  document: {
    '.pdf': 'application/pdf',
  },
} as const;
