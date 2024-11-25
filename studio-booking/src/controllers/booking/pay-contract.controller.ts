import { SuccessResponse, NotFound, BadRequestError, Users, Channels, RentalContracts, RentalContractStatus } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from './contract-notification.controller';

export const payContract: RequestHandler<{ paymentSession: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const contract = await RentalContracts.findOne({ paymentLink: req.params.paymentSession });
  if (!contract) return next(new NotFound(undefined, req.lang));

  const customer = await Users.findById(req.loggedUser.id);
  if (!customer) return next(new NotFound(undefined, req.lang));


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

  await RentalContracts.updateOne(
    { paymentLink: req.params.paymentSession },
    { status: RentalContractStatus.ongoing, checkoutAt: new Date() },
  );

  await Promise.all([
    sendNotification(
      req.loggedUser.id,
      contract.sp.toString(),
      contract._id.toString(),
      'contract',
      'rental contract updates',
      `${customer?.name} pay rental contract`,
      Channels.update_contract,
    ),
    sendNotification(
      req.loggedUser.id,
      req.loggedUser.id,
      contract._id.toString(),
      'contract',
      'rental contract updates',
      'you pay rental contract successfully',
      Channels.update_contract,
    ),
  ]);

  // await onGoingExpiration.add(
  //   { contractId: contract.id },
  //   { delay: new Date(contract.deadline).getTime() - new Date().getTime() },
  // );

  res.status(200).json({ message: 'success' });
};
