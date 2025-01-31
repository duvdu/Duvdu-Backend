import { IjwtPayload, Ipagination } from '@duvdu-v1/duvdu';

/* eslint-disable @typescript-eslint/no-namespace */

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
