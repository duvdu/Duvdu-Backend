import { isauthenticated } from '@duvdu-v1/duvdu';
import express from 'express';

import * as controllers from '../controllers/userAnalysis';

export const router = express.Router();

router.route('/').get(isauthenticated, controllers.userAnalysisHandler);
