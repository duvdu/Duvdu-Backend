import { Router } from 'express';
import { isauthenticated } from '@duvdu-v1/duvdu';
import * as controllers from '../controllers/favourites/favourites.controller';
import * as val from '../validators/favourites/favourites.validator';

// TODO: add validators
const router = Router();
router.use(isauthenticated);
router.get('/', controllers.getFavourites);
router
  .route('/:projectId')
  .all(val.projectParam)
  .post(controllers.addToFavourite)
  .delete(controllers.removeFromFavourite);

export const favouriteRoutes = router;
