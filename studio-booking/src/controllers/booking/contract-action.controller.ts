import crypto from 'crypto';

import {
  SuccessResponse,
  NotFound,
  BadRequestError,
  Users,
  NotAllowedError,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { contractNotification } from './contract-notification.controller';
import { ContractStatus, RentalContracts } from '../../models/rental-contracts.model';

export const contractAction: RequestHandler<
  { contractId: string },
  SuccessResponse,
  { action: string }
> = async (req, res, next) => {
  const contract = await RentalContracts.findOne({
    _id: req.params.contractId,
    $or: [{ sp: req.loggedUser.id }, { customer: req.loggedUser.id }],
  });
  if (!contract) return next(new NotFound(undefined, req.lang));

  const isSp = contract.sp.toString() === req.loggedUser.id;

  if (isSp) {
    // throw if actionAt not undefiend or current state not pending
    if (contract.actionAt || contract.status !== ContractStatus.pending)
      return next(
        new BadRequestError(
          { en: 'action is already taken', ar: 'action is already taken' },
          req.lang,
        ),
      );
    // throw if createdAt + stageExpiration < Date.now()
    if (
      new Date(contract.createdAt).getTime() + contract.stageExpiration * 60 * 60 * 1000 <
      new Date().getTime()
    )
      return next(
        new BadRequestError({ en: 'time limit exeeded', ar: 'time limit exeeded' }, req.lang),
      );

    if (req.body.action === 'reject') {
      {
        await RentalContracts.updateOne(
          { _id: req.params.contractId },
          { status: ContractStatus.rejected, rejectedBy: 'sp', actionAt: new Date() },
        );
        await contractNotification(
          contract.id,
          contract.customer.toString(),
          'the sp refused your rental contract',
        );
      }
    } else if (req.body.action === 'accept') {
      const spUser = await Users.findOne({ _id: req.loggedUser.id }, { avaliableContracts: 1 });
      if ((spUser?.avaliableContracts || 0) < 1)
        return next(
          new NotAllowedError(
            { en: 'please, buy a plan first', ar: 'please, buy a plan first' },
            req.lang,
          ),
        );

      await Users.updateOne({ _id: req.loggedUser.id }, { $inc: { avaliableContracts: -1 } });
      // update project state to await payment
      // create payment link and send it to customer
      const paymentSession = crypto.randomBytes(16).toString('hex');
      // const paymentLink = `${req.protocol}://${req.hostname}/api/studio-booking/rental/contract/pay/${paymentSession}`;
      await RentalContracts.updateOne(
        {
          _id: req.params.contractId,
        },
        {
          status: ContractStatus.waitingForPayment,
          actionAt: new Date(),
          paymentLink: paymentSession,
        },
      );

      await contractNotification(
        contract.id,
        contract.customer.toString(),
        'the sp accepted your rental contract',
      );

      // await paymentExpiration.add(
      //   { contractId: contract.id },
      //   { delay: contract.stageExpiration * 60 * 60 * 1000 },
      // );
    }
  } else {
    if (
      req.body.action !== 'reject' ||
      !contract.actionAt ||
      ![ContractStatus.pending, ContractStatus.waitingForPayment].includes(contract.status)
    )
      return next(new BadRequestError({ en: 'invalid action', ar: 'invalid action' }, req.lang));

    // throw if actionAt + stageExpiration < Date.now()
    if (
      new Date(contract.actionAt).getTime() + contract.stageExpiration * 60 * 60 * 1000 <
      new Date().getTime()
    )
      return next(
        new BadRequestError({ en: 'time limit exeeded', ar: 'time limit exeeded' }, req.lang),
      );

    await RentalContracts.updateOne(
      { _id: req.params.contractId },
      { status: ContractStatus.rejected, rejectedBy: 'customer', actionAt: new Date() },
    );

    await contractNotification(
      contract.id,
      contract.sp.toString(),
      'the customer reject your rental contract',
    );
  }

  res.status(200).json({ message: 'success' });
};