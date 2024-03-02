import 'express-async-errors';
import { NotFound } from '@duvdu-v1/duvdu';

import { Ticket } from '../../models/Ticket.model';
import { RemoveTicketHandler } from '../../types/endpoints/ticket.endpoints';

export const removeTicketHandler: RemoveTicketHandler = async (req, res, next) => {
  const ticket = await Ticket.findByIdAndDelete(req.params.ticketId);
  if (!ticket) return next(new NotFound('ticket not found'));
  res.status(204).json({ message: 'success' });
};
