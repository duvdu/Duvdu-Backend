import 'express-async-errors';
import { NotFound, Ticket } from '@duvdu-v1/duvdu';

import { RemoveTicketHandler } from '../../types/endpoints/ticket.endpoints';

export const removeTicketHandler: RemoveTicketHandler = async (req, res, next) => {
  const ticket = await Ticket.findByIdAndDelete(req.params.ticketId);
  if (!ticket) return next(new NotFound('ticket not found'));
  res.status(204).json({ message: 'success' });
};
