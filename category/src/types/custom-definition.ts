/* eslint-disable @typescript-eslint/no-namespace */

import { IjwtPayload } from '@duvdu-v1/duvdu';

import { Ipagination } from './Pagination';

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
    }
  }
}
