import { RequestHandler } from 'express';

import { Ifeatures } from '../Features';
import { Iplan } from '../Plan';
import { Irole } from '../Role';
import { SuccessResponse } from '../success-response';

// roles
export interface CreateRoleHandler
  extends RequestHandler<unknown, SuccessResponse<{ id: string }>, Pick<Irole, 'key'>, unknown> {}

// TODO: remove all features in roleFeatures related to this role
export interface RemoveRoleHandler
  extends RequestHandler<{ roleId: string }, SuccessResponse, unknown, unknown> {}

export interface GetRolesHandler
  extends RequestHandler<
    unknown,
    SuccessResponse<{ data: Pick<Irole, 'id' | 'key'>[] }>,
    unknown,
    unknown
  > {}

export interface GetRoleHandler
  extends RequestHandler<{ roleId: string }, SuccessResponse<{ data: Irole }>, unknown, unknown> {}

// plans
export interface CreatePlanHandler
  extends RequestHandler<
    unknown,
    SuccessResponse<{ id: string }>,
    Pick<Iplan, 'title' | 'key' | 'role'>,
    unknown
  > {}

export interface UpdatePlanHandler
  extends RequestHandler<
    { planId: string },
    SuccessResponse,
    Partial<Pick<Iplan, 'title' | 'status'>>,
    unknown
  > {}

export interface RemovePlanHandler
  extends RequestHandler<{ planId: string }, SuccessResponse, unknown, unknown> {}

export interface GetPlansHandler
  extends RequestHandler<unknown, SuccessResponse<{ data: Iplan[] }>, unknown, unknown> {}

export interface GetPlanHandler
  extends RequestHandler<
    { planId: string },
    SuccessResponse<{
      data: Pick<Iplan, 'id' | 'key' | 'title'> & {
        status?: boolean;
        role: Irole;
      };
    }>
  > {}

// roleFeatures

export interface UpdateRoleHandler
  extends RequestHandler<{ roleId: string }, SuccessResponse, { features: string[] }> {}

export interface GetFeaturesHandler
  extends RequestHandler<unknown, SuccessResponse<{ data: Ifeatures[] }>, unknown, unknown> {}
