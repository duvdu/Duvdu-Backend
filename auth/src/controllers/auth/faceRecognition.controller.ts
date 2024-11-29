import {
  BadRequestError,
  Bucket,
  FOLDERS,
  NotFound,
  SuccessResponse,
  Users,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import 'express-async-errors';

export const faceRecognitionController: RequestHandler<
  unknown,
  SuccessResponse,
  unknown,
  unknown
> = async (req, res, next) => {
  const user = await Users.findById(req.loggedUser.id);
  if (!user)
    return next(
      new NotFound({ ar: 'لا يمكن العثور على المستخدم', en: 'User not found' }, req.lang),
    );

  const faceRecognition = <Express.Multer.File[]>(req.files as any).faceRecognition;

  const s3 = new Bucket();

  await s3.saveBucketFiles(FOLDERS.auth, ...faceRecognition);
  const imageKey = `${FOLDERS.auth}/${faceRecognition[0].filename}`;

  // Validate face in the uploaded image

  const faceValidation = await s3.validateFace(imageKey);
  if (!faceValidation.isValid) {
    // Clean up the uploaded file if validation fails
    await s3.removeBucketFiles(imageKey);
    return next(new BadRequestError(faceValidation.error!, req.lang));
  }

  user.faceRecognition = imageKey;
  await user.save();

  return res.json({ message: 'success' });
};
