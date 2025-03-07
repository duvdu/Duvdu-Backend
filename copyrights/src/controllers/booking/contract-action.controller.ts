import crypto from 'crypto';

import {
  SuccessResponse,
  NotFound,
  BadRequestError,
  Users,
  NotAllowedError,
  Channels,
  CopyrightContracts,
  CopyrightContractStatus,
  checkUserFaceVerification,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from './contract-notification.controller';

interface NotificationParams {
  actorId: string;
  receiverId: string;
  contractId: string;
  actorName?: string;
  isActor?: boolean;
  action: string;
  customMessage?: string;
}

const sendContractNotifications = async ({
  actorId,
  receiverId,
  contractId,
  actorName,
  isActor,
  action,
  customMessage,
}: NotificationParams) => {
  const otherPartyMessage = customMessage || `${actorName} ${action} this contract`;
  const selfMessage = `you ${action} this contract`;

  return Promise.all([
    sendNotification(
      actorId,
      receiverId,
      contractId,
      'contract',
      'copyright contract updates',
      isActor ? otherPartyMessage : selfMessage,
      Channels.notification,
    ),
    sendNotification(
      actorId,
      actorId,
      contractId,
      'contract',
      'copyright contract updates',
      isActor ? selfMessage : otherPartyMessage,
      Channels.notification,
    ),
  ]);
};

const handleSpAction = async (
  contract: any,
  action: string,
  userId: string,
  sp: any,
  lang: string,
) => {
  const validStatuses = {
    reject: [CopyrightContractStatus.pending, CopyrightContractStatus.updateAfterFirstPayment],
    accept: [CopyrightContractStatus.pending, CopyrightContractStatus.updateAfterFirstPayment],
  };

  const isVerified = await checkUserFaceVerification(userId);

  if (!isVerified)
    throw new BadRequestError(
      { en: 'provider not verified with face recognition', ar: 'المزود غير موثوق بالوجه' },
      lang,
    );

  if (!validStatuses[action as keyof typeof validStatuses]?.includes(contract.status)) {
    throw new NotAllowedError(
      {
        en: `invalid action, contract status is ${contract.status}`,
        ar: `invalid action, contract status is ${contract.status}`,
      },
      lang,
    );
  }

  if (action === 'reject') {
    await CopyrightContracts.updateOne(
      { _id: contract._id },
      { status: CopyrightContractStatus.rejected, rejectedBy: 'sp', actionAt: new Date() },
    );

    // if status after first payment
    if (contract.status === CopyrightContractStatus.updateAfterFirstPayment) {
      const user = await Users.findOneAndUpdate(
        { _id: userId },
        { $inc: { avaliableContracts: 1 } },
      );
      await sendNotification(
        userId,
        contract.sp.toString(),
        contract._id.toString(),
        'contract',
        'available contracts',
        `${user?.name} available contracts is ${user?.avaliableContracts}`,
        Channels.notification,
      );
    }

    await sendContractNotifications({
      actorId: userId,
      receiverId: contract.customer.toString(),
      contractId: contract._id.toString(),
      actorName: sp?.name,
      isActor: true,
      action: 'reject',
    });
  } else if (action === 'accept') {
    if (contract.status === CopyrightContractStatus.pending) {
      const spUser = await Users.findOne({ _id: userId }, { avaliableContracts: 1 });

      if ((spUser?.avaliableContracts || 0) < 1) {
        throw new NotAllowedError(
          { en: 'please, buy a plan first', ar: 'please, buy a plan first' },
          lang,
        );
      }
    }

    const paymentSession = crypto.randomBytes(16).toString('hex');
    const newStatus =
      contract.status === CopyrightContractStatus.pending
        ? CopyrightContractStatus.waitingForFirstPayment
        : CopyrightContractStatus.waitingForTotalPayment;

    const firstPaymentAmount = contract.firstPaymentAmount
      ? contract.firstPaymentAmount
      : (contract.totalPrice * 0.1).toFixed(2);
    const secondPaymentAmount =  (contract.totalPrice - firstPaymentAmount).toFixed(2);

    await CopyrightContracts.updateOne(
      { _id: contract._id },
      {
        status: newStatus,
        actionAt: new Date(),
        paymentLink: paymentSession,
        firstPaymentAmount: firstPaymentAmount,
        secondPaymentAmount: secondPaymentAmount
      },
    );

    const customMessage = `${sp?.name} accept this contract, please pay to complete this contract`;
    await sendContractNotifications({
      actorId: userId,
      receiverId: contract.customer.toString(),
      contractId: contract._id.toString(),
      actorName: sp?.name,
      isActor: true,
      action: 'accept',
      customMessage,
    });
  }
};

const handleCustomerAction = async (
  contract: any,
  action: 'cancel' | 'reject',
  userId: string,
  customer: any,
  lang: string,
) => {
  const validStatuses = {
    cancel: [CopyrightContractStatus.pending],
    reject: [
      CopyrightContractStatus.waitingForFirstPayment,
      CopyrightContractStatus.waitingForTotalPayment,
    ],
  } as const;

  if (!validStatuses[action]?.includes(contract.status as never)) {
    throw new NotAllowedError(
      {
        en: `invalid action, contract status is ${contract.status}`,
        ar: `invalid action, contract status is ${contract.status}`,
      },
      lang,
    );
  }

  const status =
    action === 'cancel' ? CopyrightContractStatus.canceled : CopyrightContractStatus.rejected;

  await CopyrightContracts.updateOne(
    { _id: contract._id },
    { status, rejectedBy: 'customer', actionAt: new Date() },
  );

  await sendContractNotifications({
    actorId: userId,
    receiverId: contract.sp.toString(),
    contractId: contract._id.toString(),
    actorName: customer?.name,
    isActor: true,
    action: action,
  });
};

export const contractAction: RequestHandler<
  { contractId: string },
  SuccessResponse,
  { action: 'accept' | 'reject' | 'cancel' }
> = async (req, res, next) => {
  try {
    const contract = await CopyrightContracts.findOne({
      _id: req.params.contractId,
      $or: [{ sp: req.loggedUser.id }, { customer: req.loggedUser.id }],
    });

    if (!contract) return next(new NotFound(undefined, req.lang));

    // check stage expiration
    if (
      new Date(contract.createdAt).getTime() + contract.stageExpiration * 60 * 60 * 1000 <
      new Date().getTime()
    ) {
      return next(
        new BadRequestError({ en: 'time limit exceeded', ar: 'time limit exceeded' }, req.lang),
      );
    }

    const isSp = contract.sp.toString() === req.loggedUser.id;
    const actor = await Users.findById(isSp ? contract.sp : contract.customer);

    if (isSp) {
      if (req.body.action === 'cancel') {
        throw new NotAllowedError(
          {
            en: 'SP cannot cancel contract',
            ar: 'لا يمكن للمزود إلغاء العقد',
          },
          req.lang,
        );
      }
      await handleSpAction(
        contract,
        req.body.action as 'reject' | 'accept',
        req.loggedUser.id,
        actor,
        req.lang,
      );
    } else {
      if (req.body.action === 'accept') {
        throw new NotAllowedError(
          {
            en: 'Customer cannot accept contract',
            ar: 'لا يمكن للعميل قبول العقد',
          },
          req.lang,
        );
      }
      await handleCustomerAction(
        contract,
        req.body.action as 'reject' | 'cancel',
        req.loggedUser.id,
        actor,
        req.lang,
      );
    }

    res.status(200).json({ message: 'success' });
  } catch (error) {
    next(error);
  }
};
