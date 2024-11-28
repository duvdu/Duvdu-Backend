import 'express-async-errors';

import { NotFound, Setting } from '@duvdu-v1/duvdu';

import { AddSettingHandler } from '../../types/endpoints/setting.endpoint';

export const addSettingHandler: AddSettingHandler = async (req, res, next) => {
  const setting = await Setting.findById(req.params.settingId);
  if (!setting)
    return next(new NotFound({ en: 'setting not found', ar: 'الإعدادات غير موجودة' }, req.lang));

  if (req.body.time) setting.expirationTime.push({ time: req.body.time });
  if (req.body.contractSubscriptionPercentage)
    setting.contractSubscriptionPercentage = req.body.contractSubscriptionPercentage;

  await setting.save();

  res.status(200).json({ message: 'success', data: setting });
};
