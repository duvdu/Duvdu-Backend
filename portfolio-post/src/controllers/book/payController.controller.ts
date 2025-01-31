import {
  BadRequestError,
  Channels,
  NotAllowedError,
  NotFound,
  SuccessResponse,
  Users,
  ProjectContract,
  ProjectContractStatus,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from './sendNotification';

export const payContract: RequestHandler<{ paymentSession: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const contract = await ProjectContract.findOne({ paymentLink: req.params.paymentSession });
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

  const user = await Users.findById(req.loggedUser.id);
  if (!user) return next(new NotFound(undefined, req.lang));

  // TODO: record the transaction from payment gateway webhook

  if (contract.status === ProjectContractStatus.waitingForFirstPayment) {
    const user = await Users.findById(contract.sp);
    if (user && user.avaliableContracts === 0) {
      await sendNotification(
        req.loggedUser.id,
        contract.sp.toString(),
        contract._id.toString(),
        'contract',
        'contract subscription',
        'you not have avaliable contracts right now',
        Channels.update_contract,
      );
      return next(
        new BadRequestError(
          {
            en: 'service provider not have avaliable contracts right now',
            ar: 'لا يتوفر لدى مقدم الخدمة عقود متاحة في الوقت الحالي',
          },
          req.lang,
        ),
      );
    }

    // increment the user contracts count
    const updatedUser = await Users.findOneAndUpdate(
      { _id: contract.sp },
      { $inc: { avaliableContracts: -1 } },
    );

    await ProjectContract.updateOne(
      { paymentLink: req.params.paymentSession },
      {
        status: ProjectContractStatus.updateAfterFirstPayment,
        firstCheckoutAt: new Date(),
        firstPaymentAmount: ((10 * contract.totalPrice) / 100).toFixed(2),
        secondPaymentAmount: contract.totalPrice - (10 * contract.totalPrice) / 100,
      },
    );

    await Promise.all([
      sendNotification(
        req.loggedUser.id,
        contract.sp.toString(),
        contract._id.toString(),
        'contract',
        'available contracts',
        `${user?.name} your available contracts is ${updatedUser?.avaliableContracts}`,
        Channels.update_contract,
      ),
      sendNotification(
        req.loggedUser.id,
        contract.sp.toString(),
        contract._id.toString(),
        'contract',
        'project contract updates',
        `${user?.name} paid 10% of the amount`,
        Channels.update_contract,
      ),
      sendNotification(
        req.loggedUser.id,
        req.loggedUser.id,
        contract._id.toString(),
        'contract',
        'project contract updates',
        'you paid 10% of the amount',
        Channels.update_contract,
      ),
    ]);
  } else if (contract.status === ProjectContractStatus.waitingForTotalPayment) {
    await ProjectContract.updateOne(
      { paymentLink: req.params.paymentSession },
      {
        status: ProjectContractStatus.ongoing,
        totalCheckoutAt: new Date(),
        secondPaymentAmount: contract.totalPrice - contract.firstPaymentAmount,
      },
    );

    await Promise.all([
      sendNotification(
        req.loggedUser.id,
        contract.sp.toString(),
        contract._id.toString(),
        'contract',
        'project contract updates',
        `${user?.name} paid the total amount`,
        Channels.update_contract,
      ),
      sendNotification(
        req.loggedUser.id,
        req.loggedUser.id,
        contract._id.toString(),
        'contract',
        'project contract updates',
        'you paid the total amount',
        Channels.update_contract,
      ),
    ]);
  } else
    return next(
      new NotAllowedError(
        {
          en: `current contract status is ${contract.status}`,
          ar: `حالة العقد الحالية هي ${contract.status}`,
        },
        req.lang,
      ),
    );

  res.status(200).json({ message: 'success' });
};
