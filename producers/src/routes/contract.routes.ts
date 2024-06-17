import express from 'express';



import * as handler from '../controllers/contract';

export const router = express.Router();



router.route('/').post(handler.createContractHandler);