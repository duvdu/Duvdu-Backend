import crypto from 'crypto';

import {
  SuccessResponse,
  NotFound,
  BadRequestError,
  Users,
  NotAllowedError,
  Channels,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

// import { firstPaymentExpiration, totalPaymentExpiration } from '../../config/expiration-queue';
import { sendNotification } from './contract-notification.controller';
import { CopyrightContracts, ContractStatus } from '../../models/copyright-contract.model';

export const contractAction: RequestHandler<
  { contractId: string },
  SuccessResponse,
  { action: 'accept' | 'reject' | 'cancel' }
> = async (req, res, next) => {
  const contract = await CopyrightContracts.findOne({
    _id: req.params.contractId,
    $or: [{ sp: req.loggedUser.id }, { customer: req.loggedUser.id }],
  });
  if (!contract) return next(new NotFound(undefined, req.lang));

  // check stage expiration
  if (
    new Date(contract.createdAt).getTime() + contract.stageExpiration * 60 * 60 * 1000 <
    new Date().getTime()
  )
    return next(
      new BadRequestError({ en: 'time limit exeeded', ar: 'time limit exeeded' }, req.lang),
    );

  const isSp = contract.sp.toString() === req.loggedUser.id;
  const sp = await Users.findById(contract.sp);
  const customer = await Users.findById(contract.customer);
  // take action
  if (isSp) {
    /*
      if action = reject && contract.status = pending
        - project rejected & done
      if action = accept && contract.status = pending
        - project status = waiting for pay 10
    */
    if (req.body.action === 'reject' && contract.status === ContractStatus.pending) {
      await CopyrightContracts.updateOne(
        { _id: req.params.contractId },
        { status: ContractStatus.rejected, rejectedBy: 'sp', actionAt: new Date() },
      );

      await sendNotification(
        req.loggedUser.id,
        contract.customer.toString(),
        contract._id.toString(),
        'contract',
        'copyright contract updates',
        `${sp?.name} reject this contract`,
        Channels.update_contract,
      );
    } else if (req.body.action === 'accept' && contract.status === ContractStatus.pending) {
      const spUser = await Users.findOne({ _id: req.loggedUser.id }, { avaliableContracts: 1 });

      if ((spUser?.avaliableContracts || 0) < 1)
        return next(
          new NotAllowedError(
            { en: 'please, buy a plan first', ar: 'please, buy a plan first' },
            req.lang,
          ),
        );

      await Users.updateOne({ _id: req.loggedUser.id }, { $inc: { avaliableContracts: -1 } });
      const paymentSession = crypto.randomBytes(16).toString('hex');
      await CopyrightContracts.updateOne(
        { _id: req.params.contractId },
        {
          status: ContractStatus.waitingForFirstPayment,
          actionAt: new Date(),
          paymentLink: paymentSession,
        },
      );

      await sendNotification(
        req.loggedUser.id,
        contract.customer.toString(),
        contract._id.toString(),
        'contract',
        'copyright contract updates',
        `${sp?.name} accept this contract , please pay to complete this contract`,
        Channels.update_contract,
      );

      // await firstPaymentExpiration.add(
      //   { contractId: contract.id },
      //   { delay: (contract.stageExpiration || 0) * 60 * 60 * 1000 },
      // );
    } else if (
      req.body.action === 'reject' &&
      contract.status === ContractStatus.updateAfterFirstPayment
    ) {
      await CopyrightContracts.updateOne(
        { _id: req.params.contractId },
        { status: ContractStatus.rejected, rejectedBy: 'sp', actionAt: new Date() },
      );

      await sendNotification(
        req.loggedUser.id,
        contract.customer.toString(),
        contract._id.toString(),
        'contract',
        'copyright contract updates',
        `${sp?.name} reject this contract`,
        Channels.update_contract,
      );
    } else if (
      req.body.action === 'accept' &&
      contract.status === ContractStatus.updateAfterFirstPayment
    ) {
      const paymentSession = crypto.randomBytes(16).toString('hex');
      await CopyrightContracts.updateOne(
        { _id: req.params.contractId },
        {
          status: ContractStatus.waitingForTotalPayment,
          actionAt: new Date(),
          paymentLink: paymentSession,
        },
      );

      await sendNotification(
        req.loggedUser.id,
        contract.customer.toString(),
        contract._id.toString(),
        'contract',
        'copyright contract updates',
        `${sp?.name} accept contract, please pay to complete this contract`,
        Channels.update_contract,
      );

      // await totalPaymentExpiration.add(
      //   { contractId: contract.id },
      //   { delay: (contract.stageExpiration || 0) * 60 * 60 * 1000 },
      // );
    } else
      return next(
        new NotAllowedError(
          {
            en: 'invalid action, contract status is ' + contract.status,
            ar: 'invalid action, contract status is ' + contract.status,
          },
          req.lang,
        ),
      );
  } else {
    /*
      if action = reject && contract.status = waiting for pay 10
        - project rejected & done
      if action = accept && contract.status = waiting for pay 10
        - project status = update after first payment
      if action = reject && contract.status = waiting for total payment
        - project rejected & done

      if action = reject && contract.status = update after first pay
      - project rejected & done
      if action = accept && contract.status = update after first pay
        - project status = waiting for totol payment
    */

    if (req.body.action === 'cancel' && contract.status === ContractStatus.pending) {
      await CopyrightContracts.updateOne(
        { _id: req.params.contractId },
        { status: ContractStatus.canceled, rejectedBy: 'customer', actionAt: new Date() },
      );

      await sendNotification(
        req.loggedUser.id,
        contract.sp.toString(),
        contract._id.toString(),
        'contract',
        'copyright contract updates',
        `${customer?.name} canceled this contract`,
        Channels.update_contract,
      );
    } else if (req.body.action === 'reject' && contract.status === ContractStatus.waitingForFirstPayment) {
      await CopyrightContracts.updateOne(
        { _id: req.params.contractId },
        { status: ContractStatus.rejected, rejectedBy: 'customer', actionAt: new Date() },
      );

      await sendNotification(
        req.loggedUser.id,
        contract.sp.toString(),
        contract._id.toString(),
        'contract',
        'copyright contract updates',
        `${customer?.name} reject this contract`,
        Channels.update_contract,
      );
    } else if (
      req.body.action === 'reject' &&
      contract.status === ContractStatus.waitingForTotalPayment
    ) {
      await CopyrightContracts.updateOne(
        { _id: req.params.contractId },
        { status: ContractStatus.rejected, rejectedBy: 'customer', actionAt: new Date() },
      );

      await sendNotification(
        req.loggedUser.id,
        contract.sp.toString(),
        contract._id.toString(),
        'contract',
        'copyright contract updates',
        `${customer?.name} reject this contract`,
        Channels.update_contract,
      );
    } else
      return next(
        new NotAllowedError(
          {
            en: 'invalid action, contract status is ' + contract.status,
            ar: 'invalid action, contract status is ' + contract.status,
          },
          req.lang,
        ),
      );
  }
  res.status(200).json({ message: 'success' });
};
