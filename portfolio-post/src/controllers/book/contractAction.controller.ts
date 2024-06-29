import 'express-async-errors';

import crypto from 'crypto';

import { BadRequestError, NotAllowedError, NotFound, Users } from '@duvdu-v1/duvdu';

import { ContractStatus, ProjectContract } from '../../models/projectContract.model';
import { ContractActionHandler } from '../../types/contract.endpoint';


export const contractActionHandler:ContractActionHandler = async (req,res,next)=>{
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

  if (isSp) {

    if (req.body.action === 'reject' && contract.status === ContractStatus.pending)
      await ProjectContract.updateOne(
        { _id: req.params.contractId },
        { status: ContractStatus.rejected, rejectedBy: 'sp', actionAt: new Date() },
      );
    else if (req.body.action === 'accept' && contract.status === ContractStatus.pending) {
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
          status: ContractStatus.waitingForFirstPayment,
          actionAt: new Date(),
          paymentLink: paymentSession,
        },
      );
    } else if (
      req.body.action === 'reject' &&
          contract.status === ContractStatus.updateAfterFirstPayment
    )
      await ProjectContract.updateOne(
        { _id: req.params.contractId },
        { status: ContractStatus.rejected, rejectedBy: 'sp', actionAt: new Date() },
      );
    else if (
      req.body.action === 'accept' &&
          contract.status === ContractStatus.updateAfterFirstPayment
    ) {
      const paymentSession = crypto.randomBytes(16).toString('hex');
      await ProjectContract.updateOne(
        { _id: req.params.contractId },
        {
          status: ContractStatus.waitingForTotalPayment,
          actionAt: new Date(),
          paymentLink: paymentSession,
        },
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
  } else {

    if (req.body.action === 'reject' && contract.status === ContractStatus.waitingForFirstPayment)
      await ProjectContract.updateOne(
        { _id: req.params.contractId },
        { status: ContractStatus.rejected, rejectedBy: 'customer', actionAt: new Date() },
      );
    else if (
      req.body.action === 'accept' &&
          contract.status === ContractStatus.waitingForFirstPayment
    )
      await ProjectContract.updateOne(
        { _id: req.params.contractId },
        { status: ContractStatus.updateAfterFirstPayment, actionAt: new Date() },
      );
    else if (
      req.body.action === 'reject' &&
          contract.status === ContractStatus.waitingForTotalPayment
    )
      await ProjectContract.updateOne(
        { _id: req.params.contractId },
        { status: ContractStatus.rejected, rejectedBy: 'customer', actionAt: new Date() },
      );
    else
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

  // TODO: notifications
  res.status(200).json({ message: 'success' });
};