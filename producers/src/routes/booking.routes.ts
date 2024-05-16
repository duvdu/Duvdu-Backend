import {  FOLDERS, globalPaginationMiddleware, globalUploadMiddleware, isauthenticated } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/booking';
import * as val from '../validators/booking/booking.val';

export const router = express.Router();


router.use(isauthenticated);
router.route('/')
  .post(
    globalUploadMiddleware(FOLDERS.portfolio_post ,{
      maxSize: 50 * 1024 * 1024,
      fileTypes: ['image', 'video', 'application/pdf', 'text/plain'],
    }).array('attachments' , 10) , val.createContractVal , handler.createContarctHandler)
  .get(val.getContractsVal,globalPaginationMiddleware , handler.getContractsPagination,handler.getContractsHandler);

router.route('/:contractId')
  .post(val.createAppointmentVal , handler.createAppointmentBooking)
  .get(val.getContractVal , handler.getContractHandler)
  .patch(val.updateContractVal , handler.updateContractHandler);