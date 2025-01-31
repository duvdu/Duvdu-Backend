import 'express-async-errors';

import { Isetting, NotFound, Setting } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const updateSettingHandler: RequestHandler<
  { settingId: string },
  unknown,
  Pick<Isetting, 'contractSubscriptionPercentage'>
> = async (req, res, next) => {
  const setting = await Setting.findByIdAndUpdate(req.params.settingId, req.body, { new: true });

  if (!setting)
    return next(new NotFound({ en: 'setting not found', ar: 'الإعدادات غير موجودة' }, req.lang));

  res.status(200).json({ message: 'success', data: setting });
};
