import { RequestHandler } from 'express';
import { Icontract } from './Contract';
import { Iorder } from './Order';

type successResponse<T> = T & {
  message: 'success';
};

export interface UpdateContractHandler
  extends RequestHandler<
    { contractId: string },
    successResponse<unknown>,
    Partial<Pick<Icontract, 'status' | 'submit'>>
  > {}

// i am the source user
export interface GetClientsContractHandler
  extends RequestHandler<
    unknown,
    successResponse<{
      count: number;
      data: Icontract & { targetUser: { id: string; profileImage: string; name: string } }[];
    }>,
    unknown
  > {}

// i am the target user
export interface GetCreativesContractHandler
  extends RequestHandler<
    unknown,
    successResponse<{
      count: number;
      data: Icontract & { sourceUser: { id: string; profileImage: string; name: string } }[];
    }>,
    unknown
  > {}
