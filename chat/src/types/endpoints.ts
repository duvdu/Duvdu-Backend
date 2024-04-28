import { SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { ImessageDoc } from '../models/message.model';



export interface SendMessageHandler
extends RequestHandler<{receiver:string} , SuccessResponse<{data:ImessageDoc}> , Partial<Pick<ImessageDoc , 'content' | 'media' | 'receiver'>> , unknown>{}

export interface updateMessageHandler
extends RequestHandler<{receiver:string , message:string} , SuccessResponse<{data:ImessageDoc}> , Partial<Pick<ImessageDoc , 'content' | 'media'>> , unknown >{}

export interface GetLoggedUserChatsHandler
extends RequestHandler<unknown , SuccessResponse<{data:[ImessageDoc[]]}> , unknown , {limit?:number , page?:number}>{}

export interface getSpecificChatHandler
extends RequestHandler<{receiver:string} , SuccessResponse<{data:ImessageDoc[]}> , unknown , {limit?:number , page?:number}>{}

export interface DeleteMessageHandler
extends RequestHandler<{receiver:string , message:string} , SuccessResponse<unknown> , unknown , unknown>{}

export interface DeleteChatHandler
extends RequestHandler<{receiver:string} , SuccessResponse<unknown> , unknown , unknown>{}

export interface markMessageAsWatchedHandler
extends RequestHandler<{message:string} , SuccessResponse<unknown> , {messages:[string]} , unknown>{}

export interface getChatFromUserToUserHandler
extends RequestHandler<{sender:string , receiver:string} , SuccessResponse<{data:ImessageDoc[]}> , unknown , {limit?:number , page?:number}>{}

