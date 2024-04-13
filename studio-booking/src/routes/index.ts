import { checkRequiredFields, FOLDERS, isauthenticated, uploadProjectMedia } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/projects';
import * as val from '../validators/index';



export const router = express.Router();

router.route('/')
  .post(
    uploadProjectMedia(FOLDERS.studio_booking),
    checkRequiredFields({ fields: ['cover', 'attachments'] }),
    val.createProjectVal,
    handler.createProjectHandler
  );

router.route('/:projectId/equipment/:equipmentId')
  .put(val.updateEquipmentVal , handler.updateEquipmentHandler)
  .delete(val.deleteEquipmentVal , handler.deleteEquipmentHandler);

router.route('/:projectId')
  .patch(
    uploadProjectMedia(FOLDERS.studio_booking),
    val.updateProjectVal,
    handler.updateProjectHandler
  ).post(
    val.addEquipmentVal,
    handler.addEquipmentHandler
  ).delete(
    val.deleteProjectVal,
    handler.removeProjectHandler
  ).get(
    val.deleteProjectVal,
    handler.getProjectHandler
  );

