import 'express-async-errors';

import crypto from 'crypto';

import {
  BadRequestError,
  Channels,
  NotAllowedError,
  NotFound,
  Users,
  ProjectContract,
  ProjectContractStatus,
} from '@duvdu-v1/duvdu';

import { sendNotification } from './sendNotification';
import { ContractActionHandler } from '../../types/contract.endpoint';

export const contractActionHandler: ContractActionHandler = async (req, res, next) => {
  const contract = await ProjectContract.findOne({
    _id: req.params.contractId,
    $or: [{ sp: req.loggedUser.id }, { customer: req.loggedUser.id }],
  });

  if (!contract) return next(new NotFound(undefined, req.lang));

  if (
    new Date(contract.createdAt).getTime() + contract.stageExpiration * 60 * 60 * 1000 <
    new Date().getTime()
  )
    return next(
      new BadRequestError({ en: 'time limit exceeded', ar: 'تم تجاوز الحد الزمني' }, req.lang),
    );

  const isSp = contract.sp.toString() === req.loggedUser.id;

  const sp = await Users.findById(contract.sp);
  const customer = await Users.findById(contract.customer);

  if (isSp) {
    if (req.body.action === 'reject' && contract.status === ProjectContractStatus.pending) {
      await ProjectContract.updateOne(
        { _id: req.params.contractId },
        { status: ProjectContractStatus.rejected, rejectedBy: 'sp', actionAt: new Date() },
      );

      // send notification from sp
      await Promise.all([
        sendNotification(
          req.loggedUser.id,
          contract.customer.toString(),
          contract._id.toString(),
          'contract',
          'project contract updates',
          `${sp?.name} reject this contract`,
          Channels.update_contract,
        ),
        sendNotification(
          req.loggedUser.id,
          req.loggedUser.id,
          contract._id.toString(),
          'contract',
          'project contract updates',
          'you rejected this contract',
          Channels.update_contract,
        ),
      ]);
    } else if (req.body.action === 'accept' && contract.status === ProjectContractStatus.pending) {
      const spUser = await Users.findOne({ _id: req.loggedUser.id }, { avaliableContracts: 1 });

      if ((spUser?.avaliableContracts || 0) < 1)
        return next(
          new NotAllowedError(
            { en: 'please, buy a plan first', ar: 'يرجى شراء خطة أولاً' },
            req.lang,
          ),
        );

      await Users.updateOne({ _id: req.loggedUser.id }, { $inc: { avaliableContracts: -1 } });
      const paymentSession = crypto.randomBytes(16).toString('hex');
      await ProjectContract.updateOne(
        { _id: req.params.contractId },
        {
          status: ProjectContractStatus.waitingForFirstPayment,
          actionAt: new Date(),
          paymentLink: paymentSession,
          firstPaymentAmount: ((10 * contract.totalPrice) / 100).toFixed(2),
        },
      );

      // send notification from sp
      await Promise.all([
        sendNotification(
          req.loggedUser.id,
          contract.customer.toString(),
          contract._id.toString(),
          'contract',
          'project contract updates',
          `${sp?.name} accept this contract`,
          Channels.update_contract,
        ),
        sendNotification(
          req.loggedUser.id,
          req.loggedUser.id,
          contract._id.toString(),
          'contract',
          'project contract updates',
          'you accepted this contract',
          Channels.update_contract,
        ),
      ]);

      // add expiration for first payment
      // const delay = contract.stageExpiration * 3600 * 1000;

      // await firstPayMentQueue.add({contractId:contract._id.toString()} , {delay});
    } else if (
      req.body.action === 'reject' &&
      contract.status === ProjectContractStatus.updateAfterFirstPayment
    ) {
      await ProjectContract.updateOne(
        { _id: req.params.contractId },
        { status: ProjectContractStatus.rejected, rejectedBy: 'sp', actionAt: new Date() },
      );

      // send notification from sp
      await Promise.all([
        sendNotification(
          req.loggedUser.id,
          contract.customer.toString(),
          contract._id.toString(),
          'contract',
          'project contract updates',
          `${sp?.name} reject this contract`,
          Channels.update_contract,
        ),
        sendNotification(
          req.loggedUser.id,
          req.loggedUser.id,
          contract._id.toString(),
          'contract',
          'project contract updates',
          'you rejected this contract',
          Channels.update_contract,
        ),
      ]);
    } else if (
      req.body.action === 'accept' &&
      contract.status === ProjectContractStatus.updateAfterFirstPayment
    ) {
      const paymentSession = crypto.randomBytes(16).toString('hex');
      await ProjectContract.updateOne(
        { _id: req.params.contractId },
        {
          status: ProjectContractStatus.waitingForTotalPayment,
          actionAt: new Date(),
          paymentLink: paymentSession,
        },
      );

      // send notification from sp
      await Promise.all([
        sendNotification(
          req.loggedUser.id,
          contract.customer.toString(),
          contract._id.toString(),
          'contract',
          'project contract updates',
          `${sp?.name} accept this contract`,
          Channels.update_contract,
        ),
        sendNotification(
          req.loggedUser.id,
          req.loggedUser.id,
          contract._id.toString(),
          'contract',
          'project contract updates',
          'you accepted this contract',
          Channels.update_contract,
        ),
      ]);

      // add second payment expiration
      // const delay = contract.stageExpiration * 3600 * 1000;
      // await secondPayMentQueue.add({contractId:contract._id.toString()} , {delay});
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
    if (req.body.action === 'cancel' && contract.status === ProjectContractStatus.pending) {
      await ProjectContract.updateOne(
        { _id: req.params.contractId, status: ProjectContractStatus.pending },
        { status: ProjectContractStatus.canceled, rejectedBy: 'customer', actionAt: new Date() },
      );

      await Promise.all([
        sendNotification(
          req.loggedUser.id,
          contract.sp.toString(),
          contract._id.toString(),
          'contract',
          'project contract updates',
          `${customer?.name} canceled this contract`,
          Channels.update_contract,
        ),
        sendNotification(
          req.loggedUser.id,
          req.loggedUser.id,
          contract._id.toString(),
          'contract',
          'project contract updates',
          'you canceled this contract',
          Channels.update_contract,
        ),
      ]);
    } else if (
      req.body.action === 'reject' &&
      contract.status === ProjectContractStatus.waitingForFirstPayment
    ) {
      await ProjectContract.updateOne(
        { _id: req.params.contractId },
        { status: ProjectContractStatus.rejected, rejectedBy: 'customer', actionAt: new Date() },
      );

      await Promise.all([
        sendNotification(
          req.loggedUser.id,
          contract.sp.toString(),
          contract._id.toString(),
          'contract',
          'project contract updates',
          `${customer?.name} reject this contract`,
          Channels.update_contract,
        ),
        sendNotification(
          req.loggedUser.id,
          req.loggedUser.id,
          contract._id.toString(),
          'contract',
          'project contract updates',
          'you rejected this contract',
          Channels.update_contract,
        ),
      ]);
    } else if (
      req.body.action === 'reject' &&
      contract.status === ProjectContractStatus.waitingForTotalPayment
    ) {
      await ProjectContract.updateOne(
        { _id: req.params.contractId },
        { status: ProjectContractStatus.rejected, rejectedBy: 'customer', actionAt: new Date() },
      );
      // send notification to sp
      await Promise.all([
        sendNotification(
          req.loggedUser.id,
          contract.sp.toString(),
          contract._id.toString(),
          'contract',
          'project contract updates',
          `${customer?.name} reject this contract`,
          Channels.update_contract,
        ),
        sendNotification(
          req.loggedUser.id,
          req.loggedUser.id,
          contract._id.toString(),
          'contract',
          'project contract updates',
          'you rejected this contract',
          Channels.update_contract,
        ),
      ]);
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
