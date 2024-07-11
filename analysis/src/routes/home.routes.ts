import express from 'express';

import * as handler from '../controllers/home';
import { getProjectByIdHandler } from '../controllers/projects/get-project-by-id.controller';

export const router = express.Router();

router.get('/trendycategory', handler.getTrendyCategoriesHandler);
router.get('/discovertags', handler.getDiscoverTagsHandler);
router.get('/popularsubcategory', handler.getPopularSubCategoriesHandler);
router.get('/:projectId', getProjectByIdHandler);
