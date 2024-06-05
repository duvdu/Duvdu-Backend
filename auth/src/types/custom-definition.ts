/* eslint-disable @typescript-eslint/no-namespace */

import { IjwtPayload , Ipagination } from '@duvdu-v1/duvdu';

declare module 'express-session' {
  interface SessionData {
    access: string;
    refresh: string;
    mobileAccess:string;
    mobileRefresh:string;
  }
}

declare global {
  namespace Express {
    interface Request {
      loggedUser: IjwtPayload;
      pagination: Ipagination;
      lang:'ar'|'en'
    }
  }
}
