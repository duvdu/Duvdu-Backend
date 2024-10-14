import {
  SuccessResponse,
  NotFound,
  BadRequestError,
  NotAllowedError,
  Users,
  Channels,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

// import { contractNotification } from './contract-notification.controller';
// import {
//   onGoingExpiration,
//   updateAfterFirstPaymentExpiration,
// } from '../../config/expiration-queue';
import { sendNotification } from './contract-notification.controller';
import { CopyrightContracts, ContractStatus } from '../../models/copyright-contract.model';

export const payContract: RequestHandler<{ paymentSession: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const contract = await CopyrightContracts.findOne({ paymentLink: req.params.paymentSession });
  if (!contract) return next(new NotFound(undefined, req.lang));

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
  if (contract.status === ContractStatus.waitingForFirstPayment) {
    await CopyrightContracts.updateOne(
      { paymentLink: req.params.paymentSession },
      {
        status: ContractStatus.updateAfterFirstPayment,
        firstCheckoutAt: new Date(),
        firstPaymentAmount: ((10 * contract.totalPrice) / 100).toFixed(2),
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

    await sendNotification(
      req.loggedUser.id,
      contract.sp.toString(),
      contract._id.toString(),
      'contract',
      'copyright contract updates',
      `${user?.name} paid 10% of the amount`,
      Channels.update_contract,
    );
  } else if (contract.status === ContractStatus.waitingForTotalPayment) {
    await CopyrightContracts.updateOne(
      { paymentLink: req.params.paymentSession },
      {
        status: ContractStatus.ongoing,
        totalCheckoutAt: new Date(),
        secondPaymentAmount: contract.totalPrice - contract.firstPaymentAmount,
      },
    );

    await sendNotification(
      req.loggedUser.id,
      contract.sp.toString(),
      contract._id.toString(),
      'contract',
      'copyright contract updates',
      `${user?.name} paid the total amount`,
      Channels.update_contract,
    );

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
