import crypto from 'crypto';

import {
  SuccessResponse,
  NotFound,
  BadRequestError,
  Users,
  NotAllowedError,
  Channels,
  TeamContractStatus,
  TeamContract,
  UserStatus,
  checkUserFaceVerification,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { updateUserStatus } from './updateUserStatus';
// import { PayMentQueue } from '../../utils/expirationQueue';
import { sendNotification } from '../project/sendNotification';

export const contractAction: RequestHandler<
  { contractId: string },
  SuccessResponse,
  { action: string }
> = async (req, res, next) => {
  try {
    const contract = await TeamContract.findOne({
      _id: req.params.contractId,
      $or: [{ sp: req.loggedUser.id }, { customer: req.loggedUser.id }],
    });
    if (!contract) return next(new NotFound(undefined, req.lang));

    const isVerified = await checkUserFaceVerification(req.loggedUser.id);

    if (!isVerified)
      return next(
        new BadRequestError(
          { en: 'user not verified with face recognition', ar: 'المستخدم غير موثوق بالوجه' },
          req.lang,
        ),
      );

    const isSp = contract.sp.toString() === req.loggedUser.id;

    const sp = await Users.findById(contract.sp);
    const customer = await Users.findById(contract.customer);

    if (isSp) {
      // throw if actionAt not undefiend or current state not pending
      if (contract.actionAt || contract.status !== TeamContractStatus.pending)
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
          await TeamContract.updateOne(
            { _id: req.params.contractId },
            { status: TeamContractStatus.rejected, rejectedBy: 'sp', actionAt: new Date() },
          );

          await updateUserStatus(
            contract.project.toString(),
            contract.category.toString(),
            contract.sp.toString(),
            UserStatus.rejected,
            req.lang,
          );

          await Promise.all([
            await sendNotification(
              req.loggedUser.id,
              contract.customer.toString(),
              contract._id.toString(),
              'contract',
              'team project contract update',
              `${sp?.name} reject contract`,
              Channels.notification,
            ),
            sendNotification(
              req.loggedUser.id,
              req.loggedUser.id,
              contract._id.toString(),
              'contract',
              'team project contract update',
              'you reject this contract successfully',
              Channels.notification,
            ),
          ]);
        }
      } else if (req.body.action === 'accept') {
        const spUser = await Users.findOne({ _id: req.loggedUser.id }, { avaliableContracts: 1 });
        if (spUser && (spUser.avaliableContracts || 0) < 1)
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
        await TeamContract.updateOne(
          {
            _id: req.params.contractId,
          },
          {
            status: TeamContractStatus.waitingForTotalPayment,
            actionAt: new Date(),
            paymentLink: paymentSession,
          },
        );

        await updateUserStatus(
          contract.project.toString(),
          contract.category.toString(),
          contract.sp.toString(),
          UserStatus.accepted,
          req.lang,
        );

        await Promise.all([
          await sendNotification(
            req.loggedUser.id,
            contract.customer.toString(),
            contract._id.toString(),
            'contract',
            'team project contract update',
            `${sp?.name} accept contract`,
            Channels.notification,
          ),
          sendNotification(
            req.loggedUser.id,
            req.loggedUser.id,
            contract._id.toString(),
            'contract',
            'team project contract update',
            'you accept this contract successfully',
            Channels.notification,
          ),
        ]);

        // TODO:
        // const delay =  contract.stageExpiration * 60 * 60 * 1000;
        // await PayMentQueue.add(
        //   { contractId: contract.id , lang:req.lang },
        //   { delay },
        // );
      }
    } else {
      if (req.body.action === 'cancel' && contract.status === TeamContractStatus.pending) {
        await TeamContract.updateOne(
          { _id: req.params.contractId },
          { status: TeamContractStatus.canceled, rejectedBy: 'customer', actionAt: new Date() },
        );

        await updateUserStatus(
          contract.project.toString(),
          contract.category.toString(),
          contract.sp.toString(),
          UserStatus.canceled,
          req.lang,
        );

        await Promise.all([
          await sendNotification(
            req.loggedUser.id,
            contract.sp.toString(),
            contract._id.toString(),
            'contract',
            'team project contract update',
            `${customer?.name} cancel contract`,
            Channels.notification,
          ),
          sendNotification(
            req.loggedUser.id,
            req.loggedUser.id,
            contract._id.toString(),
            'contract',
            'team project contract update',
            'you cancel this contract successfully',
            Channels.notification,
          ),
        ]);

        return res.status(200).json({ message: 'success' });
      }

      if (
        req.body.action !== 'reject' ||
        !contract.actionAt ||
        ![TeamContractStatus.pending, TeamContractStatus.waitingForTotalPayment].includes(
          contract.status,
        )
      )
        return next(new BadRequestError({ en: 'invalid action', ar: 'invalid action' }, req.lang));

      // throw if actionAt + stageExpiration < Date.now()
      if (
        new Date(contract.actionAt).getTime() + contract.stageExpiration * 60 * 60 * 1000 <
        new Date().getTime()
      )
        return next(
          new BadRequestError({ en: 'time limit exceeded', ar: 'time limit exceeded' }, req.lang),
        );

      await TeamContract.updateOne(
        { _id: req.params.contractId },
        { status: TeamContractStatus.rejected, rejectedBy: 'customer', actionAt: new Date() },
      );

      await updateUserStatus(
        contract.project.toString(),
        contract.category.toString(),
        contract.sp.toString(),
        UserStatus.rejected,
        req.lang,
      );

      await Promise.all([
        await sendNotification(
          req.loggedUser.id,
          contract.sp.toString(),
          contract._id.toString(),
          'contract',
          'team project contract update',
          `${customer?.name} reject contract`,
          Channels.notification,
        ),
        sendNotification(
          req.loggedUser.id,
          req.loggedUser.id,
          contract._id.toString(),
          'contract',
          'team project contract update',
          'you reject this contract successfully',
          Channels.notification,
        ),
      ]);
    }

    res.status(200).json({ message: 'success' });
  } catch (error) {
    next(error);
  }
};
