import { ContractCancel, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const deleteContractCancel: RequestHandler<
  { contractCancelId: string },
  SuccessResponse
> = async (req, res) => {
  await ContractCancel.findByIdAndDelete(req.params.contractCancelId);

  return res.status(200).json({
    message: 'success',
  });
};
