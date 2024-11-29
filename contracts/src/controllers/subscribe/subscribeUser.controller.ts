import {  Notification, Users } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import 'express-async-errors';
import { NewNotificationPublisher } from '../../event/publisher/newNotification.publisher';
import { natsWrapper } from '../../nats-wrapper';



export const subscribeUserController: RequestHandler = async (req, res) => {

  //   const setting = await Setting.findOne();
  //   if (!setting)
  //     return next(new NotFound({ en: 'setting not found ', ar: 'الإعدادات غير موجودة' }, req.lang));

  //   const lastContracts = await Contracts.find({ sp: req.loggedUser.id })
  //     .sort({ createdAt: -1 })
  //     .limit(5)
  //     .populate('contract');
  
  //   const highestPrice = Math.max(...lastContracts.map((contract:any) => contract.totalPrice || 0));

  await Users.findByIdAndUpdate(req.loggedUser.id, { $inc: { avaliableContracts: 5 } });


  const currentUserNotification = await Notification.create({
    sourceUser: req.loggedUser.id,
    targetUser: req.loggedUser.id,
    type: 'contract_subscription',
    target: req.loggedUser.id,
    title: 'subscribe success',
    message: 'you have a new five contracts available',
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


  return res.status(200).json(<any>{ message: 'success' });
};
