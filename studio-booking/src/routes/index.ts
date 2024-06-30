import express from 'express';

import { rentalRoutes } from './rental.routes';

export const router = express.Router();

router.use('/rental', rentalRoutes);
