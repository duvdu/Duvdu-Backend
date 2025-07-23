import fs from 'fs';
import path from 'path';

import { NotFound } from '@duvdu-v1/duvdu';
import { Router } from 'express';

import { authRoutes } from './auth.routes';
// import { bookmarkRoutes } from './bookmark.routes';
import { bookmarksRoutes } from './bookmarks.routes';
import { favouriteRoutes } from './favourites.routes';
import { router as followRouter } from './follow.routes';
import { router as pagesRoutes } from './pages.routes';
import { planRoutes } from './plan.routes';
import { router as reportRoutes } from './report.routes';
import { roleRoutes } from './role.routes';
import { splashRoutes } from './splash.routes';
import { ticketsRoutes } from './ticket.routes';
import { router as withdrawRoutes } from './withdraw.routes';

const router = Router();

router.use('/auth', authRoutes);
// router.use('/saved-projects', bookmarkRoutes);
router.use('/bookmarks', bookmarksRoutes);
router.use('/tickets', ticketsRoutes);
router.use('/plans', planRoutes);
router.use('/roles', roleRoutes);
router.use('/report', reportRoutes);
router.use('/follow', followRouter);
router.use('/splash', splashRoutes);
router.use('/favourites', favouriteRoutes);
router.use('/withdraw', withdrawRoutes);
router.use('/pages', pagesRoutes);
router.get('/logs', (req, res, next) => {
  const filename = req.query.filename?.toString();

  if (!filename) {
    const logsFile = fs.readdirSync(path.resolve('logs'));
    return res.json({ paths: logsFile });
  }

  if (!fs.existsSync(path.resolve(`logs/${filename}`))) return next(new NotFound());

  const fileStream = fs.createReadStream(path.resolve(`logs/${filename}`), 'utf8');

  fileStream.pipe(res);
});

export const apiRoutes = router;
