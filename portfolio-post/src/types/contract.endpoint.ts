import { SuccessResponse , IprojectContract } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';


export interface CreateContractHandler
  extends RequestHandler<
    { projectId: string },
    SuccessResponse,
    Pick<
      IprojectContract,
      | 'address'
      | 'appointmentDate'
      | 'attachments'
      | 'details'
      | 'location'
      | 'projectScale'
      | 'startDate'
    > & {
      equipment: {
        tools: { id: string; units: 1; unitPrice?: number }[]; // use unit by one for the next scale
        functions: { id: string; units: 1; unitPrice?: number }[];
      };
    },
    unknown
  > {}

export interface UpdateContractHandler
  extends RequestHandler<
    { contractId: string },
    SuccessResponse<{ data: IprojectContract }>,
    Partial<
      Pick<IprojectContract, 'duration'> & {
        equipment: {
          tools: { id: string; units: number }[];
          functions: { id: string; units: number }[];
        };
        unitPrice: number;
        numberOfUnits: number;
      }
    >,
    unknown
  > {}

export interface ContractActionHandler
  extends RequestHandler<
    { contractId: string },
    SuccessResponse,
    { action: 'accept' | 'reject' | 'cancel' },
    unknown
  > {}
