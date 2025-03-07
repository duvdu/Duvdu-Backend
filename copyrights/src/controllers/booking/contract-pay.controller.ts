import {
  SuccessResponse,
  NotFound,
  BadRequestError,
  NotAllowedError,
  Users,
  Channels,
  CopyrightContracts,
  CopyrightContractStatus,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

// import { contractNotification } from './contract-notification.controller';
// import {
//   onGoingExpiration,
//   updateAfterFirstPaymentExpiration,
// } from '../../config/expiration-queue';
import { sendNotification } from './contract-notification.controller';

export const payContract: RequestHandler<{ paymentSession: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const contract = await CopyrightContracts.findOne({ paymentLink: req.params.paymentSession });
  if (!contract) return next(new NotFound(undefined, req.lang));

  if (contract.customer.toString() !== req.loggedUser.id)
    return next(
      new NotAllowedError(
        {
          en: 'you are not allowed to pay this contract',
          ar: 'ليس لديك الصلاحية لإتمام هذا العقد',
        },
        req.lang,
      ),
    );

  if (
    new Date(contract.actionAt).getTime() + contract.stageExpiration * 60 * 60 * 1000 <
    new Date().getTime()
  )
    return next(
      new BadRequestError(
        { en: 'payment link is expired', ar: 'payment link is expired' },
        req.lang,
      ),
    );

  const user = await Users.findById(req.loggedUser.id);
  if (!user) return next(new NotFound(undefined, req.lang));

  // TODO: record the transaction from payment gateway webhook
  if (contract.status === CopyrightContractStatus.waitingForFirstPayment) {
    const user = await Users.findById(contract.sp);
    if (user && user.avaliableContracts === 0) {
      await sendNotification(
        req.loggedUser.id,
        contract.sp.toString(),
        contract._id.toString(),
        'contract',
        'contract subscription',
        'you not have avaliable contracts right now',
        Channels.notification,
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

    const updatedUser = await Users.findByIdAndUpdate(user?._id, {
      $inc: { avaliableContracts: -1 },
    });

    await CopyrightContracts.updateOne(
      { _id: contract._id },
      {
        status: CopyrightContractStatus.updateAfterFirstPayment,
        firstCheckoutAt: new Date(),
        firstPaymentAmount: ((10 * contract.totalPrice) / 100).toFixed(2),
        secondPaymentAmount: contract.totalPrice - (10 * contract.totalPrice) / 100,
      },
    );

    // const appointmentDate = new Date(contract.appointmentDate);
    // await updateAfterFirstPaymentExpiration.add(
    //   { contractId: contract.id },
    //   {
    //     delay:
    //       (contract.stageExpiration || 0) * 60 * 60 * 1000 +
    //       (appointmentDate.getTime() - new Date().getTime()),
    //   },
    // );

    await Promise.all([
      // send notification to the service provider
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
        'copyright contract updates',
        `${user?.name} paid 10% of the amount`,
        Channels.notification,
      ),
      sendNotification(
        req.loggedUser.id,
        req.loggedUser.id,
        contract._id.toString(),
        'contract',
        'copyright contract updates',
        'you paid 10% of the amount successfully',
        Channels.notification,
      ),
    ]);
  } else if (contract.status === CopyrightContractStatus.waitingForTotalPayment) {
    await CopyrightContracts.updateOne(
      { _id: contract._id },
      {
        status: CopyrightContractStatus.ongoing,
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
        'copyright contract updates',
        `${user?.name} paid the total amount`,
        Channels.notification,
      ),
      sendNotification(
        req.loggedUser.id,
        req.loggedUser.id,
        contract._id.toString(),
        'contract',
        'copyright contract updates',
        'you paid the total amount successfully',
        Channels.notification,
      ),
    ]);

    // check after expiration date by 24 hour
    // await onGoingExpiration.add(
    //   { contractId: contract.id },
    //   { delay: /*new Date(contract.deadline).getTime() - Date.now() + 24 * 60 **/ 60 * 1000 },
    // );
  } else
    return next(
      new NotAllowedError(
        {
          en: `current contract status is ${contract.status}`,
          ar: `current contract status is ${contract.status}`,
        },
        req.lang,
      ),
    );

  res.status(200).json({ message: 'success' });
};
