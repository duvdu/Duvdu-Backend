import { RequestHandler } from 'express';

import { Iorder } from './Order';
import { Iproject } from '../models/project';

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
    unknown,
    successResponse<{
      count: number;
      data: Pick<Iproject, 'id' | 'cover' | 'title' | 'projectBudget'> &
        {
          user: { id: string; name: string; profileImage: string };
          creatives: { id: string; name: string; profileImage: string }[];
        }[];
    }>,
    unknown,
    {
      title: string;
      user: string;
      projectBudget: { from: number; to: number };
      category: string;
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
