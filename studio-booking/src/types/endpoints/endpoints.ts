/* eslint-disable @typescript-eslint/no-namespace */

import { IjwtPayload, Ipagination, IstudioBooking } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { Iorder } from '../Order';

declare module 'express-session' {
  interface SessionData {
    access: string;
    refresh: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      loggedUser: IjwtPayload;
      pagination: Ipagination;
    }
  }
}

type successResponse<T> = T & {
  message: 'success';
};

export interface CreateProjectHandler
  extends RequestHandler<
    unknown,
    successResponse<{ data: IstudioBooking }>,
    Pick<
      IstudioBooking,
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
      | 'category'
      | 'creatives'
    > & { invitedCreatives?: [{ phoneNumber: { number: string }; fees: number }] }
  > {}

export interface UpdateProjectHandler
  extends RequestHandler<
    { projectId: string },
    successResponse<{ data: IstudioBooking }>,
    Partial<
      Pick<
        IstudioBooking,
        | 'attachments'
        | 'cover'
        | 'studioName'
        | 'studioNumber'
        | 'studioEmail'
        | 'desc'
        | 'location'
        | 'searchKeywords'
        | 'pricePerHour'
        | 'insurance'
        | 'showOnHome'
        | 'creatives'
      > & { invitedCreatives?: [{ phoneNumber: { number: string }; fees: number }] }
    >
  > {}

export interface GetProjectHandler
  extends RequestHandler<{ projectId: string }, successResponse<{ data: IstudioBooking }>> {}

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

export interface UpdateEquipmentHandler
  extends RequestHandler<
    { projectId: string; equipmentId: string },
    successResponse<{ data: IstudioBooking }>,
    { name: string; fees: number },
    unknown
  > {}
export interface AddEquipmentHandler
  extends RequestHandler<
    { projectId: string },
    successResponse<{ data: IstudioBooking }>,
    { name: string; fees: number },
    unknown
  > {}

export interface DeleteEquipmentHandler
  extends RequestHandler<
    { projectId: string; equipmentId: string },
    successResponse<unknown>,
    unknown,
    unknown
  > {}
