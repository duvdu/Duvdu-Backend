import {
  BadRequestError,
  Channels,
  NotAllowedError,
  NotFound,
  SuccessResponse,
  TeamContract,
  TeamContractStatus,
  Users,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from '../project/sendNotification';

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

  // increment the user contracts count
  const updatedUser = await Users.findOneAndUpdate({ _id: contract.sp }, { $inc: { avaliableContracts: -1 } });
  const user = await Users.findById(contract.customer);

  // send notification to the service provider
  await Promise.all([
    sendNotification(
      req.loggedUser.id,
      contract.sp.toString(),
      contract._id.toString(),
      'contract',
      'available contracts',
      `${user?.name} your available contracts is ${updatedUser?.avaliableContracts}`,
      Channels.notification,
    ),
    sendNotification(
      req.loggedUser.id,
      contract.sp.toString(),
      contract._id.toString(),
      'contract',
      'team contract updates',
      `${user?.name} paid 10% of the amount`,
      Channels.notification,
    ),
  ]);

  //  TODO: ongoing expiration

  res.status(200).json({ message: 'success' });
};
