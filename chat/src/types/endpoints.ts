/* eslint-disable @typescript-eslint/no-namespace */
import { SuccessResponse , IjwtPayload , Ipagination } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { ImessageDoc } from '../models/message.model';




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





export interface SendMessageHandler
extends RequestHandler<unknown , SuccessResponse<{data:ImessageDoc}> , Partial<Pick<ImessageDoc , 'content' | 'receiver'>> , unknown>{}

export interface UpdateMessageHandler
extends RequestHandler<{message:string} , SuccessResponse<{data:ImessageDoc}> , Partial<Pick<ImessageDoc , 'content' | 'reactions'>> , unknown >{}

export interface GetLoggedUserChatsHandler
extends RequestHandler<unknown , SuccessResponse<{data:[ImessageDoc[]]}> , unknown , {limit?:number , page?:number}>{}

export interface DeleteMessageHandler
extends RequestHandler<{message:string} , SuccessResponse<unknown> , unknown , unknown>{}

export interface DeleteChatHandler
extends RequestHandler<{receiver:string} , SuccessResponse<unknown> , unknown , unknown>{}

export interface getSpecificChatHandler
extends RequestHandler<{receiver:string} , SuccessResponse<{data:ImessageDoc[]}> , unknown , {limit?:number , page?:number}>{}

export interface markMessageAsWatchedHandler
extends RequestHandler<{message:string} , SuccessResponse<unknown> , {messages:[string]} , unknown>{}

export interface getChatFromUserToUserHandler
extends RequestHandler<{sender:string , receiver:string} , SuccessResponse<{data:ImessageDoc[]}> , unknown , {limit?:number , page?:number}>{}

