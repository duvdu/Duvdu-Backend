import express from 'express';

import { responseWebhook } from '../controllers';

export const router = express.Router();

router.get('/paymob/webhook', responseWebhook);
