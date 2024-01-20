import { RequestHandler } from 'express';

import { Iuser } from './User';

// param, res, req, query
export interface IsigninHandler
  extends RequestHandler<
    undefined,
    { token: string },
    Partial<Pick<Iuser, 'username' | 'phoneNumber' | 'password'>>,
    undefined
  > {}
