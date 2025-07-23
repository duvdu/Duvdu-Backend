import {
  FOLDERS,
  globalUploadMiddleware,
  isauthenticated,
  isauthorized,
  PERMISSIONS,
} from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/settings';
import * as val from '../validators/setting.val';

export const router = express.Router();

router.use(isauthenticated);

router
  .route('/')
  .post(
    isauthorized(PERMISSIONS.createSetting),
    val.createSettingVal,
    handler.createSettingHandler,
  );

router
  .route('/:settingId')
  .post(isauthorized(PERMISSIONS.createSetting), val.addExpirationVal, handler.addSettingHandler)
  .get(isauthorized(PERMISSIONS.listSettings), val.getExpirationVal, handler.getSettingHandler)
  .patch(
    isauthorized(PERMISSIONS.updateSetting),
    val.updateExpirationVal,
    handler.updateExpirationHandler,
  )
  .put(
    isauthorized(PERMISSIONS.updateSetting),
    globalUploadMiddleware(FOLDERS.auth, {
      maxSize: 400 * 1024 * 1024,
      fileTypes: ['video/*', 'image/*', 'audio/*', 'application/*'],
    }).fields([
      { name: 'default_profile', maxCount: 1 },
      { name: 'default_cover', maxCount: 1 },
    ]),
    val.updateSettingVal,
    handler.updateSettingHandler,
  )
  .delete(
    isauthorized(PERMISSIONS.deleteSetting),
    val.deleteExpirationVal,
    handler.deleteExpirationHandler,
  );
