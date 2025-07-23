import 'express-async-errors';

import { Bucket, Isetting, NotFound, Setting, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const updateSettingHandler: RequestHandler<
  { settingId: string },
  unknown,
  Pick<Isetting, 'contractSubscriptionPercentage' | 'default_profile' | 'default_cover'>
> = async (req, res) => {
  const setting = await Setting.findById(req.params.settingId);
  if (!setting) throw new NotFound({ en: 'setting not found', ar: 'الإعدادات غير موجودة' }, req.lang);
  const default_profile =
    <Express.Multer.File[] | undefined>(req.files as any).default_profile || [];

  const default_cover = <Express.Multer.File[] | undefined>(req.files as any).default_cover || [];

  const bucket = new Bucket();
  if (default_profile.length > 0) {
    await bucket.saveBucketFiles('defaults', default_profile[0]);
    req.body.default_profile = 'defaults/' + default_profile[0].filename;
    if (setting?.default_profile && !setting.default_profile.startsWith('defaults')) {
      await bucket.removeBucketFiles(setting.default_profile);
    }
    await Users.updateMany(
      { profileImage: setting.default_profile },
      { profileImage: req.body.default_profile }
    );
  }

  if (default_cover.length > 0) {
    await bucket.saveBucketFiles('defaults', default_cover[0]);
    req.body.default_cover = 'defaults/' + default_cover[0].filename;
    if (setting?.default_cover && !setting.default_cover.startsWith('defaults')) {
      await bucket.removeBucketFiles(setting.default_cover);
    }
    await Users.updateMany(
      { coverImage: setting.default_cover },
      { coverImage: req.body.default_cover }
    );
  }

  const updatedSetting = await Setting.findByIdAndUpdate(req.params.settingId, req.body, {
    new: true,
  });

  
  res.status(200).json({ message: 'success', data: updatedSetting });
};
