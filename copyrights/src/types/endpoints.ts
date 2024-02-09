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
    Pick<Iproject, 'price' | 'duration' | 'address' | 'searchKeywords'>
  > {}

export interface UpdateProjectHandler
  extends RequestHandler<
    { projectId: string },
    successResponse<unknown>,
    Partial<Pick<Iproject, 'price' | 'duration' | 'address' | 'searchKeywords'>>
  > {}

export interface GetProjectsHandler
  extends RequestHandler<
    unknown,
    successResponse<{
      count: number;
      data: Pick<Iproject, 'id' | 'price' | 'duration'> &
        {
          user: {
            id: string;
            name: string;
            profileImage: string;
            location: { lat: number; lng: number };
            averageRate: number;
            currentRank: string;
          };
        }[];
    }>,
    unknown,
    {
      user: string;
      price: { from: number; to: number };
      keywords: string[];
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
    Pick<Iorder, 'jobDetails' | 'appointmentDate' | 'location' | 'attachments' | 'totalAmount'>
  > {}
