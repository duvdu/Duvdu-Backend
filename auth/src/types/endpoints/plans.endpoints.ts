import { RequestHandler } from 'express';

import { Iplan } from '../Plan';
import { Irole } from '../Role';

type successResponse<T> = T & {
  message: 'success';
};

// roles
export interface CreateRoleHandler
  extends RequestHandler<unknown, successResponse<unknown>, Pick<Irole, 'key'>, unknown> {}

// TODO: remove all features in roleFeatures related to this role
export interface RemoveRoleHandler
  extends RequestHandler<{ roleId: string }, successResponse<unknown>, unknown, unknown> {}

export interface GetRolesHandler
  extends RequestHandler<
    unknown,
    successResponse<{ data: Pick<Irole, 'id' | 'key'>[] }>,
    unknown,
    unknown
  > {}

export interface GetRoleHandler
  extends RequestHandler<unknown, successResponse<{ data: Irole }>, unknown, unknown> {}

// plans
export interface CreatePlanHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    Pick<Iplan, 'title' | 'key' | 'role'>,
    unknown
  > {}

export interface UpdatePlanHandler
  extends RequestHandler<
    { planId: string },
    successResponse<unknown>,
    Partial<Pick<Iplan, 'title' | 'status'>>,
    unknown
  > {}

export interface RemovePlanHandler
  extends RequestHandler<{ planId: string }, successResponse<unknown>, unknown, unknown> {}

export interface GetPlansHandler
  extends RequestHandler<unknown, successResponse<{ data: Iplan[] }>, unknown, unknown> {}

export interface GetPlanHandler
  extends RequestHandler<
    unknown,
    successResponse<{
      data: Pick<Iplan, 'id' | 'key' | 'title'> & {
        status?: boolean;
        role: Irole;
      };
    }>
  > {}

// roleFeatures

export interface AddFeaturestoRoleHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    { roleId: string; Features: string[] },
    unknown
  > {}

export interface RemoveFeaturefromRoleHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    { roleId: string; Features: string[] },
    unknown
  > {}

export interface GetFeaturesHandler
  extends RequestHandler<unknown, successResponse<{ data: Ifeatures[] }>, unknown, unknown> {}
