import { RequestHandler } from 'express';

import { Icategory } from './Category';

type successResponse<T> = T & {
  message: 'success';
};

export interface createCategoryHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    Pick<Icategory, 'title' | 'image' | 'cycle' | 'tags'>,
    unknown
  > {}

export interface updateCategoryHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    Partial<Pick<Icategory, 'image' | 'cycle' | 'tags' | 'title'>>,
    unknown
  > {}

export interface removeCategoryHandler
  extends RequestHandler<{ categoryId: string }, successResponse<unknown>, unknown, unknown> {}

export interface getCategoryHandler
  extends RequestHandler<
    { categoryId: string },
    successResponse<{ data: Icategory }>,
    unknown,
    unknown
  > {}

export interface getCategoriesHandler
  extends RequestHandler<
    unknown,
    successResponse<{ data: Icategory[] }>,
    unknown,
    {
      title: string;
      cycle: number;
    }
  > {}
