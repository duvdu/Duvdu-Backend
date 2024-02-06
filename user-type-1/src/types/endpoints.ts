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
      | 'address'
      | 'tools'
      | 'equipments'
      | 'creatives'
      | 'tags'
      | 'projectBudget'
      | 'category'
      | 'projectScale'
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
        | 'title'
        | 'desc'
        | 'address'
        | 'tools'
        | 'equipments'
        | 'creatives'
        | 'tags'
        | 'projectBudget'
        | 'category'
        | 'projectScale'
        | 'showOnHome'
      >
    >
  > {}

export interface GetProjectsHandler
  extends RequestHandler<
    {
      title: string;
      user: string;
      projectBudget: { from: number; to: number };
      category: string;
      tags: string[];
    },
    successResponse<{
      count: number;
      data: Pick<Iproject, 'id' | 'cover' | 'title' | 'projectBudget'> &
        {
          user: { id: string; name: string; profileImage: string };
          creatives: { id: string; name: string; profileImage: string }[];
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
      | 'location'
      | 'attachments'
      | 'customRequirement'
      | 'shootingDays'
      | 'appointmentDate'
      | 'deadline'
      | 'projectDate'
      | 'isInstant'
      | 'totalAmount'
    >
  > {}
