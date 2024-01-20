import { IjwtPayload } from './src/types/JwtPayload';
declare module 'express-serve-static-core' {
  export interface Request {
    user?: IjwtPayload;
  }
}
