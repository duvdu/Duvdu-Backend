import { isauthenticated } from '@duvdu-v1/duvdu';
import express from 'express';

import * as controllers  from '../controllers/subscribe';


export const router = express.Router();
router.use(isauthenticated);
router.get('/check-user-subscribe', controllers.checkUserSubscribeController);
router.post('/subscribe-user', controllers.subscribeUserController);

