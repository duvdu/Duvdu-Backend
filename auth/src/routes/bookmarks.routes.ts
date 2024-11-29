import { isauthenticated, globalUploadMiddleware } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import * as bookmarkProjectControllers from '../controllers/bookmarks/bookmark-project.controller';
import * as controllers from '../controllers/bookmarks/bookmark.controller';
import * as val from '../validators/bookmark/bookmark.validator';

const router = Router();

router.use(isauthenticated);
router
  .route('/')
  .post(globalUploadMiddleware('bookmark').single('image'), val.create, controllers.createBookmark)
  .get(controllers.findBookmarks);
router
  .route('/:bookmarkId')
  .patch(globalUploadMiddleware('bookmark').single('image'), val.update, controllers.updateBookmark)
  .delete(val.bookmarkParam, controllers.removeBookmark);

router.get('/:bookmarkId/projects', bookmarkProjectControllers.getBookmarkProjects);
router
  .route('/:bookmarkId/:projectId')
  .post(bookmarkProjectControllers.addToBookmark)
  .delete(bookmarkProjectControllers.removeFromBookmark);

export const bookmarksRoutes = router;
