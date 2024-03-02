import 'express-async-errors';
import { NotFound } from '@duvdu-v1/duvdu';

import { Ticket } from '../../models/Ticket.model';
import { GetTicketHandler } from '../../types/endpoints/ticket.endpoints';

export const getTicketHandler: GetTicketHandler = async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.ticketId);
  if (!ticket) return next(new NotFound('ticket not found'));
  res.status(200).json({ message: 'success', data: ticket });
};
