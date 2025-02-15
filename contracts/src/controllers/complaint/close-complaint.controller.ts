import { ContractReports, NotFound, SuccessResponse } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const closeComplaintHandler: RequestHandler<
  { contractId: string },
  SuccessResponse
> = async (req, res, next) => {
  const complaint = await ContractReports.updateOne(
    { contractId: req.params.contractId },
    {
      state: {
        isClosed: true,
        closedBy: req.loggedUser?.id,
        feedback: req.body.feedback,
      },
    },
  );

  if (complaint.modifiedCount < 1) return next(new NotFound(undefined, req.lang));

  return res.status(200).json({ message: 'success' });
};
