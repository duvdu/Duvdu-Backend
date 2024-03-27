import { Ireport } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';


type successResponse<T> = T & {
  message: 'success';
};

export interface CreateReportHandler
  extends RequestHandler<
    unknown,
    successResponse<unknown>,
    Pick<Ireport, 'targetUser' | 'project' | 'desc' | 'attachments'>
  > {}

export interface UpdateReportHandler
  extends RequestHandler<{ reportId: string }, successResponse<unknown>, Pick<Ireport, 'state'>> {}

export interface RemoveReportHandler
  extends RequestHandler<{ reportId: string }, successResponse<unknown>> {}

export interface GetReportsHandler
  extends RequestHandler<unknown, successResponse<{ data: Ireport[] }>> {}

export interface GetReportHandler
  extends RequestHandler<{ reportId: string }, successResponse<{ data: Ireport }>> {}
