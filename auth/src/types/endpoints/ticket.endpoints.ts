import { RequestHandler } from 'express';

import { Iticket } from '../Ticket';

type successResponse<T> = T & {
  message: 'success';
};

export interface createTicketHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    Pick<Iticket, 'name' | 'phoneNumber' | 'message'>,
    unknown
  > {}

export interface getTicketHandler
  extends RequestHandler<{ ticketId: string }, successResponse<{ data: Iticket }>> {}

export interface getTicketsHandler
  extends RequestHandler<unknown, successResponse<{ data: Iticket[] }>> {}

export interface getUserTicketsHandler
  extends RequestHandler<
    unknown,
    successResponse<{ data: Pick<Iticket, 'id' | 'message' | 'name' | 'phoneNumber' | 'userId'>[] }>
  > {}

export interface removeTicketHandler
  extends RequestHandler<{ ticketId: string }, successResponse<unknown>> {}

export interface updateTicketHandler
  extends RequestHandler<{ ticketId: string }, successResponse<unknown>, Pick<Iticket, 'state'>> {}
