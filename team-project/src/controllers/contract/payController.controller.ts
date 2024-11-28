import {
  BadRequestError,
  NotAllowedError,
  NotFound,
  SuccessResponse,
  TeamContract,
  TeamContractStatus,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

export const payContract: RequestHandler<{ paymentSession: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const contract = await TeamContract.findOne({ paymentLink: req.params.paymentSession });
  if (!contract) return next(new NotFound(undefined, req.lang));

  if (
    new Date(contract.actionAt).getTime() + contract.stageExpiration * 60 * 60 * 1000 <
    new Date().getTime()
  )
    return next(
      new BadRequestError(
        { en: 'payment link is expired', ar: 'رابط الدفع منتهي الصلاحية' },
        req.lang,
      ),
    );

  // TODO: record the transaction from payment gateway webhook

  if (contract.status === TeamContractStatus.waitingForTotalPayment)
    await TeamContract.updateOne(
      { paymentLink: req.params.paymentSession },
      {
        status: TeamContractStatus.ongoing,
        totalCheckoutAt: new Date(),
        paymentAmount: contract.totalPrice,
      },
    );
  else
    return next(
      new NotAllowedError(
        {
          en: `current contract status is ${contract.status}`,
          ar: `حالة العقد الحالية هي ${contract.status}`,
        },
        req.lang,
      ),
    );

  //  TODO: ongoing expiration

  res.status(200).json({ message: 'success' });
};
