import crypto from 'crypto';

import {
  SuccessResponse,
  NotFound,
  BadRequestError,
  Users,
  NotAllowedError,
  Channels,
  RentalContractStatus,
  RentalContracts,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from './contract-notification.controller';

export const contractAction: RequestHandler<
  { contractId: string },
  SuccessResponse,
  { action: 'reject'| 'accept' | 'cancel' }
> = async (req, res, next) => {
  const contract = await RentalContracts.findOne({
    _id: req.params.contractId,
    $or: [{ sp: req.loggedUser.id }, { customer: req.loggedUser.id }],
  });
  if (!contract) return next(new NotFound(undefined, req.lang));

  const isSp = contract.sp.toString() === req.loggedUser.id;

  const sp = await Users.findById(contract.sp);
  const customer = await Users.findById(contract.customer);

  if (isSp) {
    // throw if actionAt not undefiend or current state not pending
    if (contract.actionAt || contract.status !== RentalContractStatus.pending)
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
          { status: RentalContractStatus.rejected, rejectedBy: 'sp', actionAt: new Date() },
        );

        await Promise.all([
          await sendNotification(
            req.loggedUser.id,
            contract.customer.toString(),
            contract._id.toString(),
            'contract',
            'rental contract updates',
            `${sp?.name} reject this contract`,
            Channels.update_contract,
          ),
          sendNotification(
            req.loggedUser.id,
            req.loggedUser.id,
            contract._id.toString(),
            'contract',
            'rental contract updates',
            'you reject this contract successfully',
            Channels.update_contract,
          ),
        ]);
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

      // update project state to await payment
      // create payment link and send it to customer
      const paymentSession = crypto.randomBytes(16).toString('hex');
      // const paymentLink = `${req.protocol}://${req.hostname}/api/studio-booking/rental/contract/pay/${paymentSession}`;
      await RentalContracts.updateOne(
        {
          _id: req.params.contractId,
        },
        {
          status: RentalContractStatus.waitingForPayment,
          actionAt: new Date(),
          paymentLink: paymentSession,
        },
      );

      await Promise.all([
        await sendNotification(
          req.loggedUser.id,
          contract.customer.toString(),
          contract._id.toString(),
          'contract',
          'rental contract updates',
          `${sp?.name} accept this contract`,
          Channels.update_contract,
        ),
        sendNotification(
          req.loggedUser.id,
          req.loggedUser.id,
          contract._id.toString(),
          'contract',
          'rental contract updates',
          'you accept this contract successfully',
          Channels.update_contract,
        ),
      ]);

      // await paymentExpiration.add(
      //   { contractId: contract.id },
      //   { delay: contract.stageExpiration * 60 * 60 * 1000 },
      // );
    }
  } else {

    if (req.body.action === 'cancel' && contract.status === RentalContractStatus.pending) {
      await RentalContracts.updateOne(
        { _id: req.params.contractId },
        { status: RentalContractStatus.canceled, rejectedBy: 'customer', actionAt: new Date() },
      );
  
      await Promise.all([
        sendNotification(
          req.loggedUser.id,
          contract.sp.toString(),
          contract._id.toString(),
          'contract',
          'rental contract updates',
          `${customer?.name} cancel this contract`,
          Channels.update_contract,
        ),
        sendNotification(
          req.loggedUser.id,
          req.loggedUser.id,
          contract._id.toString(),
          'contract',
          'rental contract updates',
          'you cancel this contract successfully',
          Channels.update_contract,
        ),
      ]);
    } else if (
      req.body.action !== 'reject' ||
      !contract.actionAt ||
      ![RentalContractStatus.pending, RentalContractStatus.waitingForPayment].includes(contract.status)
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

    if (req.body.action === 'reject') {
      await RentalContracts.updateOne(
        { _id: req.params.contractId },
        { status: RentalContractStatus.rejected, rejectedBy: 'customer', actionAt: new Date() },
      );
  
      await Promise.all([
        sendNotification(
          req.loggedUser.id,
          contract.sp.toString(),
          contract._id.toString(),
          'contract',
          'rental contract updates',
          `${customer?.name} reject this contract`,
          Channels.update_contract,
        ),
        sendNotification(
          req.loggedUser.id,
          req.loggedUser.id,
          contract._id.toString(),
          'contract',
          'rental contract updates',
          'you reject this contract successfully',
          Channels.update_contract,
        ),
      ]);
    }
  }

  res.status(200).json({ message: 'success' });
};