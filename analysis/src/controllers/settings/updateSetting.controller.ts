import 'express-async-errors';

import { Bucket, FOLDERS, Isetting, NotFound, Setting } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const updateSettingHandler: RequestHandler<
  { settingId: string },
  unknown,
  Pick<Isetting, 'contractSubscriptionPercentage' | 'default_profile' | 'default_cover'>
> = async (req, res, next) => {
  const default_profile =
    <Express.Multer.File[] | undefined>(req.files as any).default_profile || [];

  const default_cover = <Express.Multer.File[] | undefined>(req.files as any).default_cover || [];

  const bucket = new Bucket();
  if (default_profile.length > 0) {
    await bucket.saveBucketFiles(FOLDERS.auth, default_profile[0]);
    req.body.default_profile = default_profile[0].filename;
  }

  if (default_cover.length > 0) {
    await bucket.saveBucketFiles(FOLDERS.auth, default_cover[0]);
    req.body.default_cover = default_cover[0].filename;
  }

  const setting = await Setting.findByIdAndUpdate(req.params.settingId, req.body, { new: true });

  if (!setting)
    return next(new NotFound({ en: 'setting not found', ar: 'الإعدادات غير موجودة' }, req.lang));

  res.status(200).json({ message: 'success', data: setting });
};
