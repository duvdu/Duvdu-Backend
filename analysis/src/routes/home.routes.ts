import { optionalAuthenticated } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/home';
import { globalSearch } from '../validators/projectReview.val';
export const router = express.Router();

router.get('/trendycategory', handler.getTrendyCategoriesHandler);
router.get('/discovertags', handler.getDiscoverTagsHandler);
router.get('/popularsubcategory', handler.getPopularSubCategoriesHandler);
router.get('/minutes-per-visit', handler.getMinutesPerVisitByDayAndLocation);
router.get('/projects', handler.getTopProjectsViewsHandler);
router.get('/search'  , optionalAuthenticated, globalSearch , handler.globalSearchHandler);
