import 'express-async-errors';
import { Ticket } from '@duvdu-v1/duvdu';

import { GetUserTicketsHandler } from '../../types/endpoints/ticket.endpoints';

export const getUserTickets: GetUserTicketsHandler = async (req, res) => {
  const tickets = await Ticket.find({ userId: req.loggedUser?.id });

  res.status(200).json({ message: 'success', data: tickets });
};
