import { RequestHandler } from 'express';

import { Iterm } from '../Terms';

type successResponse<T> = T & {
  message: 'success';
};

// create if not exists
export interface CreateTermHandler
  extends RequestHandler<unknown, successResponse<unknown>, Iterm> {}

export interface GetTermHandler extends RequestHandler<unknown, successResponse<Iterm>> {}

export interface UpdateTermHandler extends RequestHandler<unknown, successResponse<unknown>> {}
