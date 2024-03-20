import { auth , isAuthorized } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as controllers from '../controllers/saved-projects';
import { Roles } from '../models/Role.model';
import { Users } from '../models/User.model';
import { Ifeatures } from '../types/Permissions';
import * as val from '../validators/saved-project';

const router = Router();

router
  .route('/')
  .all(auth(Users , Roles), isAuthorized(Ifeatures.savedProjects))
  .get(controllers.getSavedProjectsHandler)
  .post(val.createSavedProject, controllers.createSavedProjectHandler);

router
  .route('/:savedProjectId')
  .all(auth(Users,Roles), isAuthorized(Ifeatures.savedProjects))
  .get(val.savedProjectParam, controllers.getSavedProjectHandler)
  .put(val.updateSavedProject, controllers.updateSavedProjectHandler)
  .delete(val.savedProjectParam, controllers.removeSavedProjectHandler);

router
  .route('/:savedProjectId/project/:projectId')
  .all(auth(Users,Roles), isAuthorized(Ifeatures.savedProjects))
  .post(val.addProject, controllers.addProjectToSavedProjectHandler)
  .delete(val.addProject, controllers.removeProjectFromSavedProjectHandler);

export const savedProjectRoutes = router;
