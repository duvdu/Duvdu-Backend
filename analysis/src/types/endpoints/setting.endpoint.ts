import { Isetting, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export interface CreateSettingHandler
  extends RequestHandler<
    unknown,
    SuccessResponse<{ data: Isetting }>,
    Pick<Isetting, 'expirationTime'>,
    unknown
  > {}

export interface UpdateExpirationHandler
  extends RequestHandler<
    { settingId: string },
    SuccessResponse<{ data: Isetting }>,
    { expirationId: string; time: number },
    unknown
  > {}

export interface DeleteExpirationHandler
  extends RequestHandler<
    { settingId: string },
    SuccessResponse<{ data: Isetting }>,
    { expirationId: string },
    unknown
  > {}

export interface GetSettingHandler
  extends RequestHandler<
    unknown,
    SuccessResponse<{ data: Isetting }>,
    unknown,
    unknown
  > {}

export interface AddSettingHandler
  extends RequestHandler<
    { settingId: string },
    SuccessResponse<{ data: Isetting }>,
    { time?: number; contractSubscriptionPercentage?: number },
    unknown
  > {}
