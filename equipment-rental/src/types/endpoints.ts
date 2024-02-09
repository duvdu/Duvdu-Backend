import { RequestHandler } from 'express';
import { Iproject } from './Project';
import { Iorder } from './Order';

type successResponse<T> = T & {
  message: 'success';
};

export interface CreateProjectHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    Pick<
      Iproject,
      | 'attachments'
      | 'canChangeAddress'
      | 'cover'
      | 'name'
      | 'number'
      | 'desc'
      | 'address'
      | 'equipments'
      | 'searchKeywords'
      | 'pricePerHour'
      | 'insurance'
      | 'showOnHome'
    >
  > {}

export interface UpdateProjectHandler
  extends RequestHandler<
    { projectId: string },
    successResponse<unknown>,
    Partial<
      Pick<
        Iproject,
        | 'attachments'
        | 'cover'
        | 'canChangeAddress'
        | 'name'
        | 'number'
        | 'desc'
        | 'address'
        | 'equipments'
        | 'searchKeywords'
        | 'pricePerHour'
        | 'insurance'
        | 'showOnHome'
      >
    >
  > {}

export interface GetProjectsHandler
  extends RequestHandler<
    unknown,
    successResponse<{
      count: number;
      data: Pick<Iproject, 'id' | 'cover' | 'name' | 'pricePerHour'> &
        {
          user: { id: string; name: string; profileImage: string };
        }[];
    }>,
    unknown,
    {
      name: string;
      user: string;
      keywords: string[];
      price: { from: number; to: number };
    }
  > {}

export interface GetProjectHandler
  extends RequestHandler<{ projectId: string }, successResponse<{ data: Iproject }>> {}

export interface RemoveProjectHandler
  extends RequestHandler<{ projectId: string }, successResponse<unknown>> {}

export interface BookProjectHandler
  extends RequestHandler<
    { projectId: string },
    successResponse<unknown>,
    Pick<
      Iorder,
      | 'projectDetails'
      | 'equipments'
      | 'insurrance'
      | 'numberOfHours'
      | 'appointmentDate'
      | 'isInstant'
      | 'address'
      | 'totalAmount'
    >
  > {}
