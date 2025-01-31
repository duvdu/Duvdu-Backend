import 'express-async-errors';

import { NotFound, Setting } from '@duvdu-v1/duvdu';

import { AddSettingHandler } from '../../types/endpoints/setting.endpoint';

export const addSettingHandler: AddSettingHandler = async (req, res, next) => {
  const setting = await Setting.findByIdAndUpdate(
    req.params.settingId,
    { $push: { expirationTime: { time: req.body.time } } },
    { new: true },
  );

  if (!setting)
    return next(new NotFound({ en: 'setting not found', ar: 'الإعدادات غير موجودة' }, req.lang));

  res.status(200).json({ message: 'success', data: setting });
};
