import { auth } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as controllers from '../controllers/saved-projects';
import { isAuthorizedMiddleware } from '../middlewares/isAuthorized.middleware';
import { Users } from '../models/User.model';
import { Ifeatures } from '../types/Permissions';
import * as val from '../validators/saved-project';

const router = Router();

router
  .route('/')
  .all(auth(Users), isAuthorizedMiddleware(Ifeatures.savedProjects))
  .get(controllers.getSavedProjectsHandler)
  .post(val.createSavedProject, controllers.createSavedProjectHandler);

router
  .route('/:savedProjectId')
  .all(auth(Users), isAuthorizedMiddleware(Ifeatures.savedProjects))
  .get(val.savedProjectParam, controllers.getSavedProjectHandler)
  .put(val.updateSavedProject, controllers.updateSavedProjectHandler)
  .delete(val.savedProjectParam, controllers.removeSavedProjectHandler);

router
  .route('/:savedProjectId/project/:projectId')
  .all(auth(Users), isAuthorizedMiddleware(Ifeatures.savedProjects))
  .post(val.addProject, controllers.addProjectToSavedProjectHandler)
  .delete(val.addProject, controllers.removeProjectFromSavedProjectHandler);

export const savedProjectRoutes = router;
