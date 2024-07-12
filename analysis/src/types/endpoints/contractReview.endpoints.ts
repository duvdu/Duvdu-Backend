import { IContractReview, PaginationResponse, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';



export interface CreateReviewHandler
extends RequestHandler<unknown , SuccessResponse<{data:IContractReview}> , Pick<IContractReview , 'comment' | 'rate' | 'contract' | 'cycle'> , unknown>{}

export interface UpdateReviewHandler
extends RequestHandler<{reviewId:string} , SuccessResponse<{data:IContractReview}> , Partial<Pick<IContractReview , 'comment' | 'rate'>> , unknown>{}

export interface GetReviewsHandler
extends RequestHandler<unknown , PaginationResponse<{data:IContractReview[]}> , unknown , unknown>{}

export interface GetReviewHandler
extends RequestHandler<{reviewId:string} , SuccessResponse<{data:IContractReview}> , unknown , unknown>{}

export interface DeleteReviewHandler
extends RequestHandler<{reviewId:string} , SuccessResponse , unknown , unknown>{}
