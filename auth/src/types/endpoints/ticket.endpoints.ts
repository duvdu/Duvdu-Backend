import { Iticket } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

type successResponse<T> = T & {
  message: 'success';
};

export interface CreateTicketHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    Pick<Iticket, 'name' | 'phoneNumber' | 'message'>,
    unknown
  > {}

export interface GetTicketHandler
  extends RequestHandler<{ ticketId: string }, successResponse<{ data: Iticket }>> {}

export interface GetTicketsHandler
  extends RequestHandler<unknown, successResponse<{ data: Iticket[] }>> {}

export interface GetUserTicketsHandler
  extends RequestHandler<
    unknown,
    successResponse<{ data: Pick<Iticket, 'id' | 'message' | 'name' | 'phoneNumber' | 'userId'>[] }>
  > {}

export interface RemoveTicketHandler
  extends RequestHandler<{ ticketId: string }, successResponse<unknown>> {}

export interface UpdateTicketHandler
  extends RequestHandler<{ ticketId: string }, successResponse<unknown>, Pick<Iticket, 'state'>> {}
