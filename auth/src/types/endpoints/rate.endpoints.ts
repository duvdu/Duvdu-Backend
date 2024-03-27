import { Irate } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

type successResponse<T> = T & {
  message: 'success';
};
//TODO: fire event to update project total rates
//TODO: fire event to update user total rates
export interface CreateRateProjectHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    Pick<Irate, 'project' | 'rate' | 'desc'>
  > {}

export interface GetRateProjectHandler
  extends RequestHandler<{ rateId: string }, successResponse<Irate>> {}

export interface GetRatesProjectHandler
  extends RequestHandler<{ projectId: string }, successResponse<Irate[]>> {}

export interface UpdateRateProjectHandler
  extends RequestHandler<
    { rateId: string },
    successResponse<unknown>,
    Partial<Pick<Irate, 'rate' | 'desc'>>
  > {}

export interface RemoveRateProjectHandler
  extends RequestHandler<
    { rateId: string },
    successResponse<unknown>,
    Partial<Pick<Irate, 'rate' | 'desc'>>
  > {}
