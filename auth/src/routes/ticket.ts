import { auth, isAuthorized } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/ticket';
import { Roles } from '../models/Role.model';
import { Users } from '../models/User.model';
import { Ifeatures } from '../types/Permissions';
import * as val from '../validators/tickets';

const router = express.Router();
router.get('/loggedUserTicket', auth(Users , Roles), handler.getUserTickets);
router
  .route('/')
  .post(auth(Users,Roles), val.createTicketVal, handler.createTicketHandler)
  .get(auth(Users,Roles), isAuthorized( Ifeatures.getAllTickets), handler.getTicketsHandler);

router
  .route('/:ticketId')
  .put(
    auth(Users,Roles),
    isAuthorized( Ifeatures.updateTicket),
    val.updateTicket,
    handler.updateTicketHandler,
  )
  .delete(
    auth(Users,Roles),
    isAuthorized( Ifeatures.removeTicket),
    val.removeTicketVal,
    handler.removeTicketHandler,
  )
  .get(
    auth(Users,Roles),
    isAuthorized( Ifeatures.getTicket),
    val.getTicketVal,
    handler.getTicketHandler,
  );

export const ticketsRoutes = router;
