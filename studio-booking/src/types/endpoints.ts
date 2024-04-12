import { RequestHandler } from 'express';

import { Iorder } from './Order';
import { Iproject } from './Project';

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
      | 'cover'
      | 'studioName'
      | 'studioNumber'
      | 'studioEmail'
      | 'desc'
      | 'location'
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
        | 'studioName'
        | 'studioNumber'
        | 'studioEmail'
        | 'desc'
        | 'location'
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
      data: Pick<Iproject, 'id' | 'cover' | 'studioName' | 'pricePerHour'> &
        {
          user: { id: string; name: string; profileImage: string };
        }[];
    }>,
    unknown,
    {
      studioName: string;
      user: string;
      keywords: string[];
      location: { lat: number; lng: number };
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
      | 'location'
      | 'totalAmount'
    >
  > {}
