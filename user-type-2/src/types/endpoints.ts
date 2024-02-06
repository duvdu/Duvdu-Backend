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
      | 'cover'
      | 'title'
      | 'desc'
      | 'location'
      | 'equipments'
      | 'tags'
      | 'pricePerHour'
      | 'insurance'
      | 'showOnHome'
      | 'category'
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
        | 'title'
        | 'desc'
        | 'location'
        | 'equipments'
        | 'tags'
        | 'pricePerHour'
        | 'insurance'
        | 'showOnHome'
        | 'category'
      >
    >
  > {}

export interface GetProjectsHandler
  extends RequestHandler<
    {
      title: string;
      user: string;
      category: string;
      tags: string[];
      location: { lat: number; lng: number };
      price: { from: number; to: number };
    },
    successResponse<{
      count: number;
      data: Pick<Iproject, 'id' | 'cover' | 'title' | 'pricePerHour'> &
        {
          user: { id: string; name: string; profileImage: string };
        }[];
    }>
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
