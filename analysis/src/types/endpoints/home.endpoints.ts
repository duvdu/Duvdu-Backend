import { Icategory, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export interface GetTrendyCategoriesHandler
  extends RequestHandler<unknown, SuccessResponse<{ data: Icategory[] }>, unknown, unknown> {}

export interface GetDiscoverTagsHandler
  extends RequestHandler<unknown, SuccessResponse<{ data: Icategory[] }>, unknown, unknown> {}

export interface GetPopularSubCategoriesHandler
  extends RequestHandler<unknown, SuccessResponse<{ data: Icategory[] }>, unknown, unknown> {}
