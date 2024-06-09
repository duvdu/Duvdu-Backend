import { Irank, PaginationResponse, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';




export interface CreateRankHandler
extends RequestHandler<unknown , SuccessResponse<{data:Irank}> , Pick<Irank , 'actionCount' | 'rank'> , unknown >{}

export interface UpdateRankHandler
extends RequestHandler<{rankId:string} , SuccessResponse<{data:Irank}> , Partial<Pick<Irank , 'actionCount' | 'rank'>> , unknown>{}

export interface GetRankHandler
extends RequestHandler<{rankId:string} , SuccessResponse<{data:Irank}> , unknown , unknown>{}

export interface GetRanksHandler
extends RequestHandler<unknown , PaginationResponse<{data:Irank[]}> , unknown , unknown>{}

export interface DeleteRankHandler
extends RequestHandler<{rankId:string} , SuccessResponse , unknown , unknown>{}