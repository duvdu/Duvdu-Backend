/* eslint-disable @typescript-eslint/no-namespace */
import { IjwtPayload, Ipagination, Iproducer, PaginationResponse, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';




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


export interface AppendProducerHandler
extends RequestHandler<unknown , SuccessResponse<{data:Iproducer}> , Pick<Iproducer , 'category' | 'maxBudget' |'minBudget' |'searchKeywords' | 'subCategories'> & {subcategory:[{subcategory:string , tags:[string]}]} , unknown>{}

export interface UpdateProducerHandler
extends RequestHandler<{producerId:string} , SuccessResponse<{data:Iproducer}> , Pick<Iproducer , 'category' | 'maxBudget' | 'minBudget' | 'searchKeywords' | 'subCategories'>& {subcategory:[{subcategory:string , tags:[string]}]} ,unknown >{}

export interface GetProducersHandler
extends RequestHandler<unknown , PaginationResponse<{data:Iproducer[]}> , unknown , unknown>{}

export interface GetProducerHandler
extends RequestHandler<{producerId:string} , SuccessResponse<{data:Iproducer}> , unknown , unknown>{}

export interface GetLoggedProducerHandler
extends RequestHandler<unknown , SuccessResponse<{data:Iproducer}> , unknown , unknown>{}

export interface DeleteProducerHandler
extends RequestHandler<{producerId:string} , SuccessResponse , unknown , unknown>{}

export interface DeleteLoggedProducerHandler
extends RequestHandler<unknown , SuccessResponse , unknown , unknown>{}