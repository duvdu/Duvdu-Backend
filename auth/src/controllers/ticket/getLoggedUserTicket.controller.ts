import 'express-async-errors';
import { NotFound , Ticket } from '@duvdu-v1/duvdu';

import { GetUserTicketsHandler } from '../../types/endpoints/ticket.endpoints';

export const getUserTickets: GetUserTicketsHandler = async (req, res, next) => {
  const tickets = await Ticket.find({ userId: req.loggedUser?.id });

  if (tickets.length === 0) return next(new NotFound('tickets not found'));
  res.status(200).json({ message: 'success', data: tickets });
};
