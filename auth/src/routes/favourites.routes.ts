import { Router } from 'express';
import { isauthenticated } from '@duvdu-v1/duvdu';
import * as controllers from '../controllers/favourites/favourites.controller';

const router = Router();
router.use(isauthenticated);
router.get('/', controllers.getFavourites);
router
  .route('/:projectId')
  .post(controllers.addToFavourite)
  .delete(controllers.removeFromFavourite);

export const favouriteRoutes = router;
