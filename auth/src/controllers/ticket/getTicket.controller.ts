import 'express-async-errors';
import { NotFound, Ticket } from '@duvdu-v1/duvdu';

import { GetTicketHandler } from '../../types/endpoints/ticket.endpoints';

export const getTicketHandler: GetTicketHandler = async (req, res, next) => {
  const ticket = await Ticket.findById(req.params.ticketId);
  if (!ticket) return next(new NotFound(undefined , req.lang));
  res.status(200).json({ message: 'success', data: ticket });
};
