// TODO: update contract
import crypto from 'crypto';

import {
  CopyRights,
  NotAllowedError,
  NotFound,
  SuccessResponse,
  Setting,
  Contracts,
  BadRequestError,
  Users,
  Bucket,
  FOLDERS,
  Files,
  CYCLES,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { ContractStatus, CopyrightContracts } from '../../models/copyright-contract.model';

export const createContractHandler: RequestHandler<
  { projectId: string },
  SuccessResponse,
  {
    details: string;
    deadline: string;
    appointmentDate: string;
    location: { lat: number; lng: number };
    address: string;
    attachments: string[];
  }
> = async (req, res, next) => {
  const project = await CopyRights.findOne({
    _id: req.params.projectId,
    isDeleted: { $ne: true },
  });

  if (!project)
    return next(new NotFound({ en: 'project not found', ar: 'المشروع غير موجود' }, req.lang));
  if (project.user.toString() === req.loggedUser.id)
    return next(new NotAllowedError(undefined, req.lang));

  const attachments = req.files as Express.Multer.File[];
  if (attachments.length > 0) {
    req.body.attachments = attachments.map((el) => FOLDERS.copyrights + '/' + el.filename);
    await new Bucket().saveBucketFiles(FOLDERS.copyrights, ...attachments);
    Files.removeFiles(...req.body.attachments);
  }

  const stageExpiration = await getStageExpiration(new Date(req.body.deadline), req.lang);
  console.log('final stage expiration: ' + stageExpiration);

  const contract = await CopyrightContracts.create({
    ...req.body,
    customer: req.loggedUser.id,
    sp: project.user,
    project: project._id,
    totalPrice: project.price,
    stageExpiration,
    status: ContractStatus.pending,
  });

  await Contracts.create({
    customer: contract.customer,
    sp: contract.sp,
    contract: contract.id,
    ref: 'copyright_contracts',
    cycle: CYCLES.copyRights,
  });

  // TODO: send notification
  res.status(201).json({ message: 'success' });
};

const getStageExpiration = async (date: Date, lang: string) => {
  const setting = await Setting.findOne({});
  const storedExpirations = setting?.expirationTime.map((el) => el.time);
  if (!storedExpirations || storedExpirations.length === 0)
    throw new Error('stored expiry times not exists');
  console.log('storedExpirations: ', storedExpirations);

  const contractTimeToBookingDate = +((date.getTime() - new Date().getTime()) / (1000 * 60 * 60));
  console.log('contractTimeToBookingDate: ', contractTimeToBookingDate);
  if (contractTimeToBookingDate < storedExpirations[0] * 3)
    throw new NotAllowedError(
      {
        en: `invalid booking date, minimum allowed booking date must be after ${storedExpirations[0] * 2} hours`,
        ar: `invalid booking date, minimum allowed booking date must be after ${storedExpirations[0] * 2} hours`,
      },
      lang,
    );
  else if (contractTimeToBookingDate > storedExpirations.at(-1)! * 3)
    return storedExpirations.at(-1);

  const minimumAvailableExpirationStage =
    storedExpirations[storedExpirations.findIndex((el) => el * 3 > contractTimeToBookingDate) - 1];

  return minimumAvailableExpirationStage;
};

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

  // TODO: record the transaction from payment gateway webhook
  if (contract.status === ContractStatus.waitingForFirstPayment)
    await CopyrightContracts.updateOne(
      { paymentLink: req.params.paymentSession },
      {
        status: ContractStatus.updateAfterFirstPayment,
        firstCheckoutAt: new Date(),
        firstPaymentAmount: ((10 * contract.totalPrice) / 100).toFixed(2),
      },
    );
  else if (contract.status === ContractStatus.waitingForTotalPayment)
    await CopyrightContracts.updateOne(
      { paymentLink: req.params.paymentSession },
      {
        status: ContractStatus.ongoing,
        totalCheckoutAt: new Date(),
        secondPaymentAmount: contract.totalPrice - contract.firstPaymentAmount,
      },
    );
  else
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
      if action = reject && contract.status = update after first pay
        - project rejected & done
      if action = accept && contract.status = update after first pay
        - project status = waiting for totol payment
    */
    if (req.body.action === 'reject' && contract.status === ContractStatus.pending)
      await CopyrightContracts.updateOne(
        { _id: req.params.contractId },
        { status: ContractStatus.rejected, rejectedBy: 'sp', actionAt: new Date() },
      );
    else if (req.body.action === 'accept' && contract.status === ContractStatus.pending) {
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
    } else if (
      req.body.action === 'reject' &&
      contract.status === ContractStatus.updateAfterFirstPayment
    )
      await CopyrightContracts.updateOne(
        { _id: req.params.contractId },
        { status: ContractStatus.rejected, rejectedBy: 'sp', actionAt: new Date() },
      );
    else if (
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
    */
    if (req.body.action === 'reject' && contract.status === ContractStatus.waitingForFirstPayment)
      await CopyrightContracts.updateOne(
        { _id: req.params.contractId },
        { status: ContractStatus.rejected, rejectedBy: 'customer', actionAt: new Date() },
      );
    else if (
      req.body.action === 'accept' &&
      contract.status === ContractStatus.waitingForFirstPayment
    )
      await CopyrightContracts.updateOne(
        { _id: req.params.contractId },
        { status: ContractStatus.updateAfterFirstPayment, actionAt: new Date() },
      );
    else if (
      req.body.action === 'reject' &&
      contract.status === ContractStatus.waitingForTotalPayment
    )
      await CopyrightContracts.updateOne(
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
