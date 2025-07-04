import express from 'express';

import { responseWebhook } from '../controllers/webhook';

export const router = express.Router();

router.get('/paymob/webhook', responseWebhook);
