// import crypto from 'crypto';

// import {
//   SuccessResponse,
//   NotFound,
//   BadRequestError,
//   Users,
//   NotAllowedError,
//   Channels,
//   CopyrightContracts,
//   CopyrightContractStatus,
// } from '@duvdu-v1/duvdu';
// import { RequestHandler } from 'express';

// // import { firstPaymentExpiration, totalPaymentExpiration } from '../../config/expiration-queue';
// import { sendNotification } from './contract-notification.controller';

// export const contractAction: RequestHandler<
//   { contractId: string },
//   SuccessResponse,
//   { action: 'accept' | 'reject' | 'cancel' }
// > = async (req, res, next) => {
//   const contract = await CopyrightContracts.findOne({
//     _id: req.params.contractId,
//     $or: [{ sp: req.loggedUser.id }, { customer: req.loggedUser.id }],
//   });
//   if (!contract) return next(new NotFound(undefined, req.lang));

//   // check stage expiration
//   if (
//     new Date(contract.createdAt).getTime() + contract.stageExpiration * 60 * 60 * 1000 <
//     new Date().getTime()
//   )
//     return next(
//       new BadRequestError({ en: 'time limit exeeded', ar: 'time limit exeeded' }, req.lang),
//     );

//   const isSp = contract.sp.toString() === req.loggedUser.id;
//   const sp = await Users.findById(contract.sp);
//   const customer = await Users.findById(contract.customer);
//   // take action
//   if (isSp) {
//     /*
//       if action = reject && contract.status = pending
//         - project rejected & done
//       if action = accept && contract.status = pending
//         - project status = waiting for pay 10
//     */
//     if (req.body.action === 'reject' && contract.status === CopyrightContractStatus.pending) {
//       await CopyrightContracts.updateOne(
//         { _id: req.params.contractId },
//         { status: CopyrightContractStatus.rejected, rejectedBy: 'sp', actionAt: new Date() },
//       );

//       Promise.all([
//         sendNotification(
//           req.loggedUser.id,
//           contract.customer.toString(),
//           contract._id.toString(),
//           'contract',
//           'copyright contract updates',
//           `${sp?.name} reject this contract`,
//           Channels.update_contract,
//         ),
//         sendNotification(
//           req.loggedUser.id,
//           req.loggedUser.id,
//           contract._id.toString(),
//           'contract',
//           'copyright contract updates',
//           'you rejected this contract',
//           Channels.update_contract,
//         ),
//       ]);
//     } else if (req.body.action === 'accept' && contract.status === CopyrightContractStatus.pending) {
//       const spUser = await Users.findOne({ _id: req.loggedUser.id }, { avaliableContracts: 1 });

//       if ((spUser?.avaliableContracts || 0) < 1)
//         return next(
//           new NotAllowedError(
//             { en: 'please, buy a plan first', ar: 'please, buy a plan first' },
//             req.lang,
//           ),
//         );

//       await Users.updateOne({ _id: req.loggedUser.id }, { $inc: { avaliableContracts: -1 } });
//       const paymentSession = crypto.randomBytes(16).toString('hex');
//       await CopyrightContracts.updateOne(
//         { _id: req.params.contractId },
//         {
//           status: CopyrightContractStatus.waitingForFirstPayment,
//           actionAt: new Date(),
//           paymentLink: paymentSession,
//         },
//       );

//       Promise.all([
//         sendNotification(
//           req.loggedUser.id,
//           contract.customer.toString(),
//           contract._id.toString(),
//           'contract',
//           'copyright contract updates',
//           `${sp?.name} accept this contract , please pay to complete this contract`,
//           Channels.update_contract,
//         ),
//         sendNotification(
//           req.loggedUser.id,
//           req.loggedUser.id,
//           contract._id.toString(),
//           'contract',
//           'copyright contract updates',
//           'you accepted this contract, waiting for first payment',
//           Channels.update_contract,
//         ),
//       ]);

//       // await firstPaymentExpiration.add(
//       //   { contractId: contract.id },
//       //   { delay: (contract.stageExpiration || 0) * 60 * 60 * 1000 },
//       // );
//     } else if (
//       req.body.action === 'reject' &&
//       contract.status === CopyrightContractStatus.updateAfterFirstPayment
//     ) {
//       await CopyrightContracts.updateOne(
//         { _id: req.params.contractId },
//         { status: CopyrightContractStatus.rejected, rejectedBy: 'sp', actionAt: new Date() },
//       );

//       Promise.all([
//         sendNotification(
//           req.loggedUser.id,
//           contract.customer.toString(),
//           contract._id.toString(),
//           'contract',
//           'copyright contract updates',
//           `${sp?.name} reject this contract`,
//           Channels.update_contract,
//         ),
//         sendNotification(
//           req.loggedUser.id,
//           req.loggedUser.id,
//           contract._id.toString(),
//           'contract',
//           'copyright contract updates',
//           'you rejected this contract',
//           Channels.update_contract,
//         ),
//       ]);
//     } else if (
//       req.body.action === 'accept' &&
//       contract.status === CopyrightContractStatus.updateAfterFirstPayment
//     ) {
//       const paymentSession = crypto.randomBytes(16).toString('hex');
//       await CopyrightContracts.updateOne(
//         { _id: req.params.contractId },
//         {
//           status: CopyrightContractStatus.waitingForTotalPayment,
//           actionAt: new Date(),
//           paymentLink: paymentSession,
//         },
//       );

//       Promise.all([
//         sendNotification(
//           req.loggedUser.id,
//           contract.customer.toString(),
//           contract._id.toString(),
//           'contract',
//           'copyright contract updates',
//           `${sp?.name} accept contract, please pay to complete this contract`,
//           Channels.update_contract,
//         ),
//         sendNotification(
//           req.loggedUser.id,
//           req.loggedUser.id,
//           contract._id.toString(),
//           'contract',
//           'copyright contract updates',
//           'you accepted this contract, waiting for total payment',
//           Channels.update_contract,
//         ),
//       ]);

//       // await totalPaymentExpiration.add(
//       //   { contractId: contract.id },
//       //   { delay: (contract.stageExpiration || 0) * 60 * 60 * 1000 },
//       // );
//     } else
//       return next(
//         new NotAllowedError(
//           {
//             en: 'invalid action, contract status is ' + contract.status,
//             ar: 'invalid action, contract status is ' + contract.status,
//           },
//           req.lang,
//         ),
//       );
//   } else {
//     /*
//       if action = reject && contract.status = waiting for pay 10
//         - project rejected & done
//       if action = accept && contract.status = waiting for pay 10
//         - project status = update after first payment
//       if action = reject && contract.status = waiting for total payment
//         - project rejected & done

//       if action = reject && contract.status = update after first pay
//       - project rejected & done
//       if action = accept && contract.status = update after first pay
//         - project status = waiting for totol payment
//     */

//     if (req.body.action === 'cancel' && contract.status === CopyrightContractStatus.pending) {
//       await CopyrightContracts.updateOne(
//         { _id: req.params.contractId },
//         { status: CopyrightContractStatus.canceled, rejectedBy: 'customer', actionAt: new Date() },
//       );

//       Promise.all([
//         sendNotification(
//           req.loggedUser.id,
//           contract.sp.toString(),
//           contract._id.toString(),
//           'contract',
//           'copyright contract updates',
//           `${customer?.name} canceled this contract`,
//           Channels.update_contract,
//         ),
//         sendNotification(
//           req.loggedUser.id,
//           req.loggedUser.id,
//           contract._id.toString(),
//           'contract',
//           'copyright contract updates',
//           'you canceled this contract',
//           Channels.update_contract,
//         ),
//       ]);
//     } else if (
//       req.body.action === 'reject' &&
//       contract.status === CopyrightContractStatus.waitingForFirstPayment
//     ) {
//       await CopyrightContracts.updateOne(
//         { _id: req.params.contractId },
//         { status: CopyrightContractStatus.rejected, rejectedBy: 'customer', actionAt: new Date() },
//       );

//       Promise.all([
//         sendNotification(
//           req.loggedUser.id,
//           contract.sp.toString(),
//           contract._id.toString(),
//           'contract',
//           'copyright contract updates',
//           `${customer?.name} reject this contract`,
//           Channels.update_contract,
//         ),
//         sendNotification(
//           req.loggedUser.id,
//           req.loggedUser.id,
//           contract._id.toString(),
//           'contract',
//           'copyright contract updates',
//           'you rejected this contract',
//           Channels.update_contract,
//         ),
//       ]);
//     } else if (
//       req.body.action === 'reject' &&
//       contract.status === CopyrightContractStatus.waitingForTotalPayment
//     ) {
//       await CopyrightContracts.updateOne(
//         { _id: req.params.contractId },
//         { status: CopyrightContractStatus.rejected, rejectedBy: 'customer', actionAt: new Date() },
//       );

//       Promise.all([
//         sendNotification(
//           req.loggedUser.id,
//           contract.sp.toString(),
//           contract._id.toString(),
//           'contract',
//           'copyright contract updates',
//           `${customer?.name} reject this contract`,
//           Channels.update_contract,
//         ),
//         sendNotification(
//           req.loggedUser.id,
//           req.loggedUser.id,
//           contract._id.toString(),
//           'contract',
//           'copyright contract updates',
//           'you rejected this contract',
//           Channels.update_contract,
//         ),
//       ]);
//     } else
//       return next(
//         new NotAllowedError(
//           {
//             en: 'invalid action, contract status is ' + contract.status,
//             ar: 'invalid action, contract status is ' + contract.status,
//           },
//           req.lang,
//         ),
//       );
//   }
//   res.status(200).json({ message: 'success' });
// };

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
      Channels.update_contract,
    ),
    sendNotification(
      actorId,
      actorId,
      contractId,
      'contract',
      'copyright contract updates',
      isActor ? selfMessage : otherPartyMessage,
      Channels.update_contract,
    ),
  ]);
};

const handleSpAction = async (contract: any, action: string, userId: string, sp: any, lang: string) => {
  const validStatuses = {
    reject: [CopyrightContractStatus.pending, CopyrightContractStatus.updateAfterFirstPayment],
    accept: [CopyrightContractStatus.pending, CopyrightContractStatus.updateAfterFirstPayment],
  };

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

      await Users.updateOne({ _id: userId }, { $inc: { avaliableContracts: -1 } });
    }

    const paymentSession = crypto.randomBytes(16).toString('hex');
    const newStatus =
      contract.status === CopyrightContractStatus.pending
        ? CopyrightContractStatus.waitingForFirstPayment
        : CopyrightContractStatus.waitingForTotalPayment;

    await CopyrightContracts.updateOne(
      { _id: contract._id },
      {
        status: newStatus,
        actionAt: new Date(),
        paymentLink: paymentSession,
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
    reject: [CopyrightContractStatus.waitingForFirstPayment, CopyrightContractStatus.waitingForTotalPayment],
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

  const status = action === 'cancel' ? CopyrightContractStatus.canceled : CopyrightContractStatus.rejected;

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
        throw new NotAllowedError({ 
          en: 'SP cannot cancel contract', 
          ar: 'لا يمكن للمزود إلغاء العقد' 
        }, req.lang);
      }
      await handleSpAction(contract, req.body.action as 'reject' | 'accept', req.loggedUser.id, actor, req.lang);
    } else {
      if (req.body.action === 'accept') {
        throw new NotAllowedError({ 
          en: 'Customer cannot accept contract', 
          ar: 'لا يمكن للعميل قبول العقد' 
        }, req.lang);
      }
      await handleCustomerAction(contract, req.body.action as 'reject' | 'cancel', req.loggedUser.id, actor, req.lang);
    }

    res.status(200).json({ message: 'success' });
  } catch (error) {
    next(error);
  }
};