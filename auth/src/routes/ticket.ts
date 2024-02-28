
import { auth, isAuthorized } from '@duvdu-v1/duvdu';
import express from 'express';

import * as handler from '../controllers/ticket';
import { Plans } from '../models/Plan.model';
import { Roles } from '../models/Role.model';
import { Users } from '../models/User.model';
import { Ifeatures } from '../types/Features';
import * as val from '../validators/tickets';


export const router = express.Router();
router.get('/loggedUserTicket' , auth(Users) , handler.getUserTickets);
router.route('/')
  .post(auth(Users),val.createTicketVal , handler.createTicketHandler)
  .get(auth(Users) , isAuthorized(Plans , Roles , Ifeatures.getAllTickets) , handler.getTicketsHandler);

router.route('/:ticketId')
  .put(auth(Users) , isAuthorized(Plans , Roles , Ifeatures.updateTicket) , val.updateTicket , handler.updateTicketHandler)
  .delete(auth(Users) , isAuthorized(Plans , Roles , Ifeatures.removeTicket) , val.removeTicketVal , handler.removeTicketHandler)
  .get(auth(Users) , isAuthorized(Plans , Roles , Ifeatures.getTicket) , val.getTicketVal , handler.getTicketHandler);