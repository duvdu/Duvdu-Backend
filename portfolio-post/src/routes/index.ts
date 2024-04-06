import { globalUploadMiddleware, isauthenticated } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as handlers from '../controllers/projects';
import { checkRequiredFields } from '../middlewares/check-required-files.middleware';
import * as val from '../validators/project/project.validator';

const router = Router();

router.route('/').post(
  isauthenticated,
  globalUploadMiddleware().fields([
    { name: 'cover', maxCount: 1 },
    { name: 'attachemnts', maxCount: 10 },
  ]),
  checkRequiredFields({ fields: ['cover', 'attachments'] }),
  val.create,
  handlers.createProjectHandler,
);

router
  .route('/:projectId')
  .patch(val.update, handlers.updateProjectHandler)
  .delete(val.get, handlers.removeProjectHandler);

export const apiRoutes = router;
