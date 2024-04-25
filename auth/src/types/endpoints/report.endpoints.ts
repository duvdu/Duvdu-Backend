import { PaginationResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { Ireport } from '../../../../common/src/models/report.model';


type successResponse<T> = T & {
  message: 'success';
};

export interface CreateReportHandler
  extends RequestHandler<
    unknown,
    successResponse<{data:Ireport}>,
    Pick<Ireport,  'project' | 'desc' | 'attachments'>
  > {}

export interface UpdateReportHandler
  extends RequestHandler<{ reportId: string }, successResponse<{data:Ireport}>, {feedback:string}> {}

export interface RemoveReportHandler
  extends RequestHandler<{ reportId: string }, successResponse<unknown>> {}

export interface GetReportsHandler
  extends RequestHandler<unknown, PaginationResponse<{ data: Ireport[] }>> {}

export interface GetReportHandler
  extends RequestHandler<{ reportId: string }, successResponse<{ data: Ireport }>> {}
