/* eslint-disable @typescript-eslint/no-namespace */
import {
  IjwtPayload,
  Ipagination,
  Iproducer,
  IproducerContarct,
  PaginationResponse,
  SuccessResponse,
} from '@duvdu-v1/duvdu';
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
      lang: 'ar' | 'en';
    }
  }
}

export interface AppendProducerHandler
  extends RequestHandler<
    unknown,
    SuccessResponse<{ data: Iproducer }>,
    Pick<
      Iproducer,
      'category' | 'maxBudget' | 'minBudget' | 'searchKeywords' | 'subCategories' | 'platforms'
    > & {
      subcategory: [{ subcategory: string; tags: [string] }];
    },
    unknown
  > {}

export interface UpdateProducerHandler
  extends RequestHandler<
    { producerId: string },
    SuccessResponse<{ data: Iproducer }>,
    Pick<
      Iproducer,
      'category' | 'maxBudget' | 'minBudget' | 'searchKeywords' | 'subCategories' | 'platforms'
    > & {
      subcategory: [{ subcategory: string; tags: [string] }];
    },
    unknown
  > {}

export interface GetProducersHandler
  extends RequestHandler<unknown, PaginationResponse<{ data: Iproducer[] }>, unknown, unknown> {}

export interface GetProducerHandler
  extends RequestHandler<
    { producerId: string },
    SuccessResponse<{ data: Iproducer }>,
    unknown,
    unknown
  > {}

export interface GetLoggedProducerHandler
  extends RequestHandler<unknown, SuccessResponse<{ data: Iproducer }>, unknown, unknown> {}

export interface DeleteProducerHandler
  extends RequestHandler<{ producerId: string }, SuccessResponse, unknown, unknown> {}

export interface DeleteLoggedProducerHandler
  extends RequestHandler<unknown, SuccessResponse, unknown, unknown> {}

export interface CreateContractHandler
  extends RequestHandler<
    unknown,
    SuccessResponse<{ data: IproducerContarct }>,
    Pick<
      IproducerContarct,
      | 'address'
      | 'appointmentDate'
      | 'attachments'
      | 'episodesDuration'
      | 'episodesNumber'
      | 'expectedBudget'
      | 'expectedProfits'
      | 'location'
      | 'platform'
      | 'producer'
      | 'projectDetails'
      | 'stageExpiration'
    >,
    unknown
  > {}

export interface UpdateContractHandler
  extends RequestHandler<
    { contractId: string },
    SuccessResponse<{ data: IproducerContarct }>,
    Partial<Pick<IproducerContarct, 'appointmentDate' | 'status' | 'rejectedBy'>>,
    unknown
  > {}

export interface GetContractHandler
  extends RequestHandler<
    { contractId: string },
    SuccessResponse<{ data: IproducerContarct }>,
    unknown,
    unknown
  > {}

export interface GetUserContractsHandler
  extends RequestHandler<
    unknown,
    SuccessResponse<{ data: IproducerContarct[] }>,
    unknown,
    unknown
  > {}
