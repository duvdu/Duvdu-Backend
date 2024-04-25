/* eslint-disable @typescript-eslint/no-namespace */
import { Icategory } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';



type successResponse<T> = T & {
  message: 'success';
};

export interface CreateCategoryHandler
  extends RequestHandler<
    unknown,
    successResponse<{data:Icategory}>,
    Pick<Icategory, 'title'  | 'cycle' | 'tags' | 'jobTitles' | 'status' & {cover:string}>,
    unknown
  > {}

export interface UpdateCategoryHandler
  extends RequestHandler<
    { categoryId: string },
    successResponse<{data:Icategory}>,
    Partial<Pick<Icategory, 'image'|'cycle' | 'tags' | 'title' | 'jobTitles' | 'status' >& {cover?:string}>,
    unknown
  > {}

export interface RemoveCategoryHandler
  extends RequestHandler<{ categoryId: string }, successResponse<unknown>, unknown, unknown> {}

export interface GetCategoryHandler
  extends RequestHandler<
    { categoryId: string },
    successResponse<{ data: Icategory }>,
    unknown,
    unknown
  > {}

export interface GetCategoriesHandler
  extends RequestHandler<unknown, successResponse<{ data: Icategory[] }>, unknown, unknown> {}

export interface GetCatogriesAdminHandler
  extends RequestHandler<unknown, successResponse<{ data: Icategory[] }>, unknown, unknown> {}
