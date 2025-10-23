import {
  Contracts,
  NotFound,
  Notification,
  PaymobService,
  Setting,
  Transaction,
  Users,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import 'express-async-errors';
import { NewNotificationPublisher } from '../../event/publisher/newNotification.publisher';
import { natsWrapper } from '../../nats-wrapper';

export const subscribeUserController: RequestHandler = async (req, res) => {

  const existingUser = await Users.findById(req.loggedUser.id);
  if (!existingUser)
    throw new NotFound({ en: 'user not found', ar: 'المستخدم غير موجود' }, req.lang);

  const setting = await Setting.findOne();
  if (!setting)
    throw new NotFound({ en: 'setting not found ', ar: 'الإعدادات غير موجودة' }, req.lang);

  const lastContracts = await Contracts.find({ sp: req.loggedUser.id })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('contract');

  if (!existingUser.hasFreeTime) {
    await Users.findByIdAndUpdate(req.loggedUser.id, { avaliableContracts: 5  , hasFreeTime: true });
    const currentUserNotification = await Notification.create({
      sourceUser: req.loggedUser.id,
      targetUser: req.loggedUser.id,
      type: 'contract_subscription',
      target: req.loggedUser.id,
      title: 'subscribe success',
      message: 'congratulations, you have new free contracts available',
    });

    const populatedCurrentUserNotification = await (
      await currentUserNotification.save()
    ).populate('sourceUser', 'isOnline profileImage username');

    Promise.all([
      new NewNotificationPublisher(natsWrapper.client).publish({
        notificationDetails: {
          message: currentUserNotification.message,
          title: currentUserNotification.title,
        },
        populatedNotification: populatedCurrentUserNotification,
        socketChannel: 'contract_subscription',
        targetUser: currentUserNotification.targetUser.toString(),
      }),
    ]);
    return res.status(200).json({ message: 'success', data: { newFiveContractsPrice: 5 } });
  }

  const totalPrice = lastContracts.reduce(
    (acc: number, contract: any) => acc + (contract.contract.totalPrice || 0),
    0,
  );
  const total = Number(((totalPrice * setting.contractSubscriptionPercentage) / 100).toFixed(2));

  const user = await Users.findById(req.loggedUser.id);

  let pendingTransaction = await Transaction.findOne({
    user: req.loggedUser.id,
    status: 'pending',
    isSubscription: true,
  });

  if (pendingTransaction) {
    pendingTransaction = await Transaction.findByIdAndUpdate(
      pendingTransaction._id,
      { amount: total },
      { new: true },
    );
  } else {
    pendingTransaction = await Transaction.create({
      amount: total,
      user: req.loggedUser.id,
      status: 'pending',
      isSubscription: true,
    });
  }

  const paymob = new PaymobService();
  const paymentLink = await paymob.createPaymentUrlWithUserData(
    total,
    req.loggedUser.id,
    pendingTransaction!._id.toString(),
    {
      firstName: user?.name || '',
      lastName: user?.name || '',
      email: user?.email || '',
      phone: user?.phoneNumber.number || '',
    },
    'subscribe',
  );

  res.status(200).json({ message: 'success', data: { paymentUrl: paymentLink.paymentUrl } });

  // return res.status(200).json(<any>{ message: 'success' });
};
