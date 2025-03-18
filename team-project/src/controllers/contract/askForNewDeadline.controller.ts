import {
  SuccessResponse,
  NotFound,
  TeamContract,
  TeamContractStatus,
  BadRequestError,
  Users,
  Channels,
  RequestedDeadlineStatus,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';
import { Types } from 'mongoose';

import { sendNotification } from '../project/sendNotification';

export const askForNewDeadline: RequestHandler<
  { contractId: string },
  SuccessResponse,
  { deadline: Date }
> = async (req, res) => {
  const contract = await TeamContract.findById(req.params.contractId);

  if (!contract) {
    throw new NotFound(
      { ar: 'عذراً لم يتم العثور على العقدة', en: 'Sorry, the contract was not found' },
      req.lang,
    );
  }

  if (contract.status !== TeamContractStatus.ongoing) {
    throw new BadRequestError(
      {
        ar: 'لا يمكن طلب جديد للموعد لهذا العقدة',
        en: 'You cannot request a new deadline for this contract',
      },
      req.lang,
    );
  }

  contract.deadline = req.body.deadline;
  contract.status = TeamContractStatus.pending;
  contract.requestedDeadline.user = new Types.ObjectId(req.loggedUser.id);
  await contract.save();

  const user = await Users.findById(req.loggedUser.id);

  await Promise.all([
    sendNotification(
      req.loggedUser.id,
      contract.sp.toString(),
      contract._id.toString(),
      'contract',
      'new deadline requested',
      `new deadline requested by ${user?.name}`,
      Channels.notification,
    ),
    sendNotification(
      req.loggedUser.id,
      contract.customer.toString(),
      contract._id.toString(),
      'contract',
      'new deadline requested',
      `new deadline requested by ${user?.name}`,
      Channels.notification,
    ),
  ]);

  res.status(200).json({ message: 'success' });
};

export const respondToNewDeadline: RequestHandler<
  { contractId: string },
  SuccessResponse,
  { status: RequestedDeadlineStatus }
> = async (req, res) => {
  const contract = await TeamContract.findById(req.params.contractId);

  if (!contract) {
    throw new NotFound(
      { ar: 'عذراً لم يتم العثور على العقدة', en: 'Sorry, the contract was not found' },
      req.lang,
    );
  }

  if (contract.status !== TeamContractStatus.pending) {
    throw new BadRequestError(
      {
        ar: 'لا يمكن الرد على طلب جديد للموعد لهذا العقدة',
        en: 'You cannot respond to a new deadline request for this contract',
      },
      req.lang,
    );
  }

  if (contract.requestedDeadline.user.toString() === req.loggedUser.id) {
    throw new BadRequestError(
      {
        ar: 'لا يمكن الرد على طلب جديد للموعد لهذا العقدة',
        en: 'You cannot respond to a new deadline request for this contract',
      },
      req.lang,
    );
  }

  contract.requestedDeadline.status = req.body.status;
  await contract.save();

  const user = await Users.findById(req.loggedUser.id);

  //#TODO: add the logic to update the contract deadline and status
  //   if (req.body.status === RequestedDeadlineStatus.approved) {

  //   }

  await Promise.all([
    sendNotification(
      req.loggedUser.id,
      contract.sp.toString(),
      contract._id.toString(),
      'contract',
      'new deadline request updated',
      `new deadline request ${req.body.status} by ${user?.name}`,
      Channels.notification,
    ),
    sendNotification(
      req.loggedUser.id,
      contract.customer.toString(),
      contract._id.toString(),
      'contract',
      'new deadline request updated',
      `new deadline request ${req.body.status} by ${user?.name}`,
      Channels.notification,
    ),
  ]);

  res.status(200).json({ message: 'success' });
};
