/* eslint-disable @typescript-eslint/no-namespace */
import { Icategory, IjwtPayload, Ipagination, PaginationResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

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
      lang: 'en' | 'ar';
    }
  }
}

type successResponse<T> = T & {
  message: 'success';
};

export interface CreateCategoryHandler
  extends RequestHandler<
    unknown,
    successResponse<{ data: Icategory }>,
    Pick<
      Icategory,
      | 'title'
      | 'cycle'
      | 'tags'
      | 'jobTitles'
      | 'status'
      | 'trend'
      | 'media'
      | 'isRelated'
      | 'relatedCategory'
      | 'insurance'
    > & { cover: string },
    unknown
  > {}

export interface UpdateCategoryHandler
  extends RequestHandler<
    { categoryId: string },
    successResponse<{ data: Icategory }>,
    Partial<
      Pick<
        Icategory,
        | 'image'
        | 'cycle'
        | 'tags'
        | 'title'
        | 'jobTitles'
        | 'status'
        | 'trend'
        | 'media'
        | 'relatedCategory'
        | 'insurance'
      > & { cover?: string }
    >,
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
  extends RequestHandler<unknown, PaginationResponse<{ data: Icategory[] }>, unknown, unknown> {}

export interface GetCatogriesAdminHandler
  extends RequestHandler<unknown, PaginationResponse<{ data: Icategory[] }>, unknown, unknown> {}
