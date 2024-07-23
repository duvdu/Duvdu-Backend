import 'express-async-errors';

import { NotFound, Setting } from '@duvdu-v1/duvdu';

import { UpdateExpirationHandler } from '../../types/endpoints/setting.endpoint';

export const updateExpirationHandler: UpdateExpirationHandler = async (req, res, next) => {
  const setting = await Setting.findById(req.params.settingId);
  if (!setting)
    return next(new NotFound({ en: 'setting not found', ar: 'الإعدادات غير موجودة' }, req.lang));

  const index = setting.expirationTime.findIndex(
    (el: any) => el._id.toString() === req.body.expirationId,
  );

  if (index === -1)
    return next(
      new NotFound(
        { en: 'expiration time not found', ar: 'وقت انتهاء الصلاحية غير موجود' },
        req.lang,
      ),
    );

  setting.expirationTime[index].time = req.body.time;

  await setting.save();
  res.status(200).json({ message: 'success', data: setting });
};
