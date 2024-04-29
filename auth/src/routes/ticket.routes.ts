import { isauthenticated, isauthorized, PERMISSIONS, optionalAuthenticated } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/ticket';
import * as val from '../validators/tickets';

const router = express.Router();
router.get('/loggedUserTicket', isauthenticated, handler.getUserTickets);
router
  .route('/')
  .post(optionalAuthenticated, val.createTicketVal, handler.createTicketHandler)
  .get(isauthenticated, isauthorized(PERMISSIONS.getAllTickets), handler.getTicketsHandler);

// router.post('/visitor', val.createTicketVal, handler.createTicketHandler);
router
  .route('/:ticketId')
  .put(
    isauthenticated,
    isauthorized(PERMISSIONS.updateTicket),
    val.updateTicket,
    handler.updateTicketHandler,
  )
  .delete(
    isauthenticated,
    isauthorized(PERMISSIONS.removeTicket),
    val.removeTicketVal,
    handler.removeTicketHandler,
  )
  .get(
    isauthenticated,
    isauthorized(PERMISSIONS.getTicket),
    val.getTicketVal,
    handler.getTicketHandler,
  );

export const ticketsRoutes = router;
