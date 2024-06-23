import crypto from 'crypto';

import {
  BadRequestError,
  NotAllowedError,
  Contracts,
  NotFound,
  SuccessResponse,
  Users,
  CYCLES,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { ContractStatus, RentalContracts } from '../../models/rental-contracts.model';
import { Rentals } from '../../models/rental.model';

export const createContractHandler: RequestHandler<
  { projectId: string },
  SuccessResponse,
  {
    details: string;
    projectScale: { numberOfUnits: number };
    bookingDate: string;
  }
> = async (req, res, next) => {
  const project = await Rentals.findOne({ _id: req.params.projectId, isDeleted: { $ne: true } });
  if (!project)
    return next(new NotFound({ en: 'project not found', ar: 'المشروع غير موجود' }, req.lang));
  if (project.user.toString() === req.loggedUser.id)
    return next(new NotAllowedError(undefined, req.lang));
  if (
    project.projectScale.minimum > req.body.projectScale.numberOfUnits ||
    project.projectScale.maximum < req.body.projectScale.numberOfUnits
  )
    return next(
      new BadRequestError(
        { en: 'invalid number of units', ar: 'invalid number of units' },
        req.lang,
      ),
    );

  const stageExpiration = await getStageExpiration(new Date(req.body.bookingDate), req.lang);

  const contract = await RentalContracts.create({
    ...req.body,
    customer: req.loggedUser.id,
    sp: project.user,
    project: project._id,
    projectScale: {
      unit: project.projectScale.unit,
      numberOfUnits: req.body.projectScale.numberOfUnits,
      unitPrice: project.projectScale.pricerPerUnit,
    },
    totalPrice: (req.body.projectScale.numberOfUnits * project.projectScale.pricerPerUnit).toFixed(
      2,
    ),
    insurance: project.insurance,
    stageExpiration,
    status: ContractStatus.pending,
  });

  await Contracts.create({
    customer: contract.customer,
    sp: contract.sp,
    contract: contract.id,
    ref: 'rental_contracts',
    cycle: CYCLES.studioBooking,
  });

  // TODO: send notification

  res.status(201).json({ message: 'success' });
};

const getStageExpiration = async (bookingDate: Date, lang: string) => {
  const storedExpirations = [4, 10, 24];
  const contractTimeToBookingDate = +(
    (bookingDate.getTime() - new Date().getTime()) /
    (1000 * 60 * 60)
  );
  if (contractTimeToBookingDate < storedExpirations[0] * 2)
    throw new NotAllowedError(
      {
        en: `invalid booking date, minimum allowed booking date must be after ${storedExpirations[0] * 2} hours`,
        ar: `invalid booking date, minimum allowed booking date must be after ${storedExpirations[0] * 2} hours`,
      },
      lang,
    );
  else if (contractTimeToBookingDate > storedExpirations.at(-1)! * 2)
    return storedExpirations.at(-1);

  const minimumAvailableExpirationStage =
    storedExpirations[storedExpirations.findIndex((el) => el > contractTimeToBookingDate) - 1];

  return minimumAvailableExpirationStage;
};

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
      await RentalContracts.updateOne(
        { _id: req.params.contractId },
        { status: ContractStatus.rejected, rejectedBy: 'sp', actionAt: new Date() },
      );
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
      await RentalContracts.updateOne({
        _id: req.params.contractId,
        status: ContractStatus.waitingForPayment,
        actionAt: new Date(),
        paymentLink: paymentSession,
      });
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
  }

  // TODO: send notification with payment link
  // const notification = await Notification.create({
  //   sourceUser: req.loggedUser.id,
  //   targetUser: isSp ? contract.sp : contract.customer,
  //   type: NotificationType.new_follower, // TODO: create new notification type
  //   target: isSp ? contract.sp : contract.customer,
  //   message: `${isSp ? 'service provider' : 'customer'} ${req.body.action} the contract`,
  //   title: 'contract action',
  // });
  // await new NewNotificationPublisher(natsWrapper.client).publish({
  //   notificationDetails: { message: notification.message, title: notification.title },
  //   populatedNotification,
  //   socketChannel: Channels.new_follower,
  //   targetUser: notification.targetUser.toString(),
  // });

  res.status(200).json({ message: 'success' });
};

export const payContract: RequestHandler<{ paymentSession: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const contract = await RentalContracts.findOne({ paymentLink: req.params.paymentSession });
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
  await RentalContracts.updateOne(
    { paymentLink: req.params.paymentSession },
    { status: ContractStatus.ongoing, checkoutAt: new Date() },
  );

  res.status(200).json({ message: 'success' });
};
