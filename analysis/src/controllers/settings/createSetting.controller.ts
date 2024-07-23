import 'express-async-errors';

import { NotFound, Setting } from '@duvdu-v1/duvdu';

import { CreateSettingHandler } from '../../types/endpoints/setting.endpoint';

export const createSettingHandler: CreateSettingHandler = async (req, res, next) => {
  const settingExist = await Setting.find();
  if (settingExist.length > 0)
    return next(
      new NotFound({ en: 'setting already created', ar: 'الإعدادات تم إنشاؤها بالفعل' }, req.lang),
    );
  const setting = await Setting.create(req.body);
  res.status(201).json({ message: 'success', data: setting });
};
