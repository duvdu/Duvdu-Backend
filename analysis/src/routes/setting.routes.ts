import { isauthenticated, isauthorized, PERMISSIONS } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/settings';
import * as val from '../validators/setting.val';

export const router = express.Router();

router.use(isauthenticated);

router
  .route('/')
  .post(
    isauthorized(PERMISSIONS.createSettingHandler),
    val.createSettingVal,
    handler.createSettingHandler,
  );

router
  .route('/:settingId')
  .post(
    isauthorized(PERMISSIONS.createSettingHandler),
    val.addExpirationVal,
    handler.addSettingHandler,
  )
  .get(val.getExpirationVal, handler.getSettingHandler)
  .patch(
    isauthorized(PERMISSIONS.updateSettingHandler),
    val.updateExpirationVal,
    handler.updateExpirationHandler,
  )
  .put(
    isauthorized(PERMISSIONS.updateSettingHandler),
    val.updateSettingVal,
    handler.updateSettingHandler,
  )
  .delete(
    isauthorized(PERMISSIONS.deleteSettingHandler),
    val.deleteExpirationVal,
    handler.deleteExpirationHandler,
  );
