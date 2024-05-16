import {
  globalPaginationMiddleware,
  isauthenticated,
  isauthorized,
  PERMISSIONS,
} from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as controllers from '../controllers/bookmarks';
import * as val from '../validators/saved-project';

const router = Router();

router
  .route('/')
  .all(isauthenticated, isauthorized(PERMISSIONS.bookmarks))
  .get(controllers.getBookmarksHandler)
  .post(val.createBookmark, controllers.createBookmarkHandler);

router
  .route('/:bookmarkId')
  .all(isauthenticated, isauthorized(PERMISSIONS.bookmarks))
  .get(val.bookmarkParam, globalPaginationMiddleware, controllers.getBookmarkHandler)
  .put(val.updateBookmark, controllers.updateBookmarkHandler)
  .delete(val.bookmarkParam, controllers.removeBookmarkHandler);

router
  .route('/:bookmarkId/project/:projectId')
  .all(isauthenticated, isauthorized(PERMISSIONS.bookmarks))
  .post(val.addProject, controllers.addProjectToBookmarksHandler)
  .delete(val.addProject, controllers.removeProjectFromBookmarkHandler);

export const bookmarkRoutes = router;
