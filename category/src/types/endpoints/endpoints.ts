/* eslint-disable @typescript-eslint/no-namespace */
import { RequestHandler } from 'express';

import { Icategory } from '../Category';


type successResponse<T> = T & {
  message: 'success';
};

export interface CreateCategoryHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    Pick<Icategory, 'title' | 'image' | 'cycle' | 'tags' | 'jobTitles' | 'status'>,
    unknown
  > {}

export interface UpdateCategoryHandler
  extends RequestHandler<
    { categoryId: string },
    successResponse<unknown>,
    Partial<Pick<Icategory, 'image' | 'cycle' | 'tags' | 'title' | 'jobTitles' | 'status'>>,
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
