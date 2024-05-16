/* eslint-disable @typescript-eslint/no-namespace */
import { IjwtPayload, Ipagination, PaginationResponse, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { Iproducer, IproducerBooking } from '../models/producers.model';



declare module 'express-session' {
  interface SessionData {
    access: string;
    refresh: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      loggedUser: IjwtPayload;
      pagination: Ipagination;
      lang: 'ar'|'en'
    }
  }
}





export interface CreateContractHandler
extends RequestHandler<unknown , SuccessResponse<{data:IproducerBooking}> , Partial<Pick<IproducerBooking , 'attachments' | 'details' | 'episodeduration' | 'episodes' | 'expectedbudget' | 'expectedprofits' | 'platform' | 'producer' >> , unknown>{}

export interface CreateAppointmentBookingHandler
extends RequestHandler<{contractId:string} , SuccessResponse<{data:IproducerBooking}> , Pick<IproducerBooking , 'appoinment'> , unknown >{}

export interface GetContractHandler
extends RequestHandler<{contractId:string} , SuccessResponse<{data:IproducerBooking}> , unknown , unknown>{}

export interface GetContractsHandler
extends RequestHandler<unknown , PaginationResponse<{data:IproducerBooking[]}> , unknown , unknown>{}

export interface UpdateContractHandler
extends RequestHandler<{contractId:string} , SuccessResponse<{data:IproducerBooking}> , Pick<IproducerBooking , 'status'> , unknown>{}






export interface GetProducersHandler
extends RequestHandler<unknown , SuccessResponse<{data:Iproducer[]}> , unknown , unknown>{}

export interface GetProducerHandler
extends RequestHandler<{producerId:string} , SuccessResponse<{data:Iproducer}> , unknown , unknown>{}

export interface AppendProducerHandler
extends RequestHandler<unknown , SuccessResponse , unknown , unknown>{}