import { isauthenticated, isauthorized, PERMISSIONS } from '@duvdu-v1/duvdu';
import express from 'express';

import * as controllers from '../controllers/userAnalysis';
import * as validators from '../validators/user';

export const router = express.Router();

router.route('/').get(isauthenticated, controllers.userAnalysisHandler);
router.route('/crm').get(isauthenticated,isauthorized(PERMISSIONS.listUserAnalysis) ,validators.userAnalysisCrmValidator, controllers.userAnalysisCrmHandler);