import crypto from 'crypto';

import {
  SuccessResponse,
  NotFound,
  BadRequestError,
  Users,
  NotAllowedError,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

// import { contractNotification } from './contract-notification.controller';
// import { firstPaymentExpiration, totalPaymentExpiration } from '../../config/expiration-queue';
import { CopyrightContracts, ContractStatus } from '../../models/copyright-contract.model';

export const contractAction: RequestHandler<
  { contractId: string },
  SuccessResponse,
  { action: 'accept' | 'reject' }
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
      // await contractNotification(
      //   contract.id,
      //   contract.customer.toString(),
      //   'copyright contract rejected by the SP',
      // );
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
      // await contractNotification(
      //   contract.id,
      //   contract.customer.toString(),
      //   `copyright contract accpted by the SP, please pay to complete this contract within ${contract.stageExpiration}h`,
      // );

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
      // await contractNotification(
      //   contract.id,
      //   contract.customer.toString(),
      //   'copyright contract rejected by the SP',
      // );
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
      // await contractNotification(
      //   contract.id,
      //   contract.customer.toString(),
      //   `copyright contract accpted by the SP, please pay to complete this contract within ${contract.stageExpiration}h`,
      // );
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
    if (req.body.action === 'reject' && contract.status === ContractStatus.waitingForFirstPayment) {
      await CopyrightContracts.updateOne(
        { _id: req.params.contractId },
        { status: ContractStatus.rejected, rejectedBy: 'customer', actionAt: new Date() },
      );
      // await contractNotification(
      //   contract.id,
      //   contract.sp.toString(),
      //   'copyright contract rejected by the customer',
      // );
    } else if (
      req.body.action === 'reject' &&
      contract.status === ContractStatus.waitingForTotalPayment
    ) {
      await CopyrightContracts.updateOne(
        { _id: req.params.contractId },
        { status: ContractStatus.rejected, rejectedBy: 'customer', actionAt: new Date() },
      );
      // await contractNotification(
      //   contract.id,
      //   contract.sp.toString(),
      //   'copyright contract rejected by the customer',
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
  }
  res.status(200).json({ message: 'success' });
};
