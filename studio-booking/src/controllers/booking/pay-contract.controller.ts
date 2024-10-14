import { SuccessResponse, NotFound, BadRequestError, Users, Channels } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from './contract-notification.controller';
import { RentalContracts, ContractStatus } from '../../models/rental-contracts.model';

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
    { status: ContractStatus.ongoing, checkoutAt: new Date() },
  );
  
  await sendNotification(
    req.loggedUser.id,
    contract.sp.toString(),
    contract._id.toString(),
    'contract',
    'rental contract updates',
    `${customer?.name} pay rental contract`,
    Channels.update_contract,
  );



  // await onGoingExpiration.add(
  //   { contractId: contract.id },
  //   { delay: new Date(contract.deadline).getTime() - new Date().getTime() },
  // );

  res.status(200).json({ message: 'success' });
};
