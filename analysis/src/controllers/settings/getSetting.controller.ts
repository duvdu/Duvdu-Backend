import 'express-async-errors';
import { NotFound, Setting } from '@duvdu-v1/duvdu';

import { GetSettingHandler } from '../../types/endpoints/setting.endpoint';

export const getSettingHandler: GetSettingHandler = async (req, res, next) => {
  const setting = await Setting.findOne();
  if (!setting)
    return next(new NotFound({ en: 'setting not found', ar: 'الإعدادات غير موجودة' }, req.lang));

  res.status(200).json({ message: 'success', data: setting });
};
