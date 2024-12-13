import {
  BadRequestError,
  Bucket,
  Categories,
  FOLDERS,
  Iuser,
  NotFound,
  Roles,
  SuccessResponse,
  Users,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import 'express-async-errors';
import { hashPassword } from '../../utils/bcrypt';

export const updateUserHandler: RequestHandler<
  { userId: string },
  SuccessResponse,
  Pick<
    Iuser,
    | 'name'
    | 'username'
    | 'password'
    | 'profileImage'
    | 'coverImage'
    | 'address'
    | 'phoneNumber'
    | 'role'
    | 'categories'
  >,
  unknown
> = async (req, res, next) => {
  const profile = await Users.findById(req.params.userId);
  if (!profile)
    return next(new NotFound({ en: 'no user found', ar: 'المستخدم غير موجود' }, req.lang));

  const coverImage = <Express.Multer.File[] | undefined>(req.files as any).coverImage || [];
  const profileImage = <Express.Multer.File[] | undefined>(req.files as any).profileImage || [];

  if (req.body.username) {
    const user = await Users.findOne({ username: req.body.username });
    if (user)
      return next(
        new BadRequestError(
          { en: 'user name already exist', ar: 'اسم المستخدم موجود بالفعل' },
          req.lang,
        ),
      );
  }

  if (req.body.phoneNumber) {
    const user = await Users.findOne({ phoneNumber: req.body.phoneNumber });
    if (user)
      return next(
        new BadRequestError(
          { en: 'phone number already exist', ar: 'رقم الهاتف موجود بالفعل' },
          req.lang,
        ),
      );
  }

  if (req.body.role) {
    const role = await Roles.findById(req.body.role);
    if (!role)
      return next(new NotFound({ en: 'role not found', ar: 'لم يتم العثور على الدور' }, req.lang));
  }

  if (req.body.categories) {
    const categoriesLength = await Categories.countDocuments({
      _id: req.body.categories.map((el) => el),
    });
    if (req.body.categories.length != categoriesLength)
      return next(
        new BadRequestError(
          { en: 'invalid categories ids', ar: 'معرفات الفئات غير صالحة' },
          req.lang,
        ),
      );
  }

  if (req.body.password) req.body.password = await hashPassword(req.body.password);

  const s3 = new Bucket();
  if (coverImage && coverImage?.length) {
    await s3.saveBucketFiles(FOLDERS.auth, ...coverImage);
    req.body.coverImage = `${FOLDERS.auth}/${coverImage[0].filename}`;
    if (profile.coverImage && !profile.coverImage.startsWith('defaults'))
      await s3.removeBucketFiles(profile.coverImage);
  }
  if (profileImage?.length) {
    await s3.saveBucketFiles(FOLDERS.auth, ...profileImage);
    req.body.profileImage = `${FOLDERS.auth}/${profileImage[0].filename}`;
    if (profile.profileImage && !profile.profileImage.startsWith('defaults'))
      await s3.removeBucketFiles(profile.profileImage);
  }

  await Users.findByIdAndUpdate(req.params.userId, req.body, { new: true, runValidators: true });

  res.status(200).json({ message: 'success' });
};
