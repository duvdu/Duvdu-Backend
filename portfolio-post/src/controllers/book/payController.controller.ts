import {
  BadRequestError,
  Channels,
  NotAllowedError,
  NotFound,
  SuccessResponse,
  Users,
  ProjectContract,
  ProjectContractStatus,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from './sendNotification';
import { PaymobService } from '../../services/paymob.service';

export const payContract: RequestHandler<{ paymentSession: string }, SuccessResponse> = async (
  req,
  res,
  next,
) => {
  const contract = await ProjectContract.findOne({ paymentLink: req.params.paymentSession });
  if (!contract) return next(new NotFound(undefined, req.lang));

  if (
    new Date(contract.actionAt).getTime() + contract.stageExpiration * 60 * 60 * 1000 <
    new Date().getTime()
  )
    return next(
      new BadRequestError(
        { en: 'payment link is expired', ar: 'رابط الدفع منتهي الصلاحية' },
        req.lang,
      ),
    );

  const user = await Users.findById(req.loggedUser.id);
  if (!user) return next(new NotFound(undefined, req.lang));

  // TODO: record the transaction from payment gateway webhook

  if (contract.status === ProjectContractStatus.waitingForFirstPayment) {
    const user = await Users.findById(contract.sp);
    if (user && user.avaliableContracts === 0) {
      await sendNotification(
        req.loggedUser.id,
        contract.sp.toString(),
        contract._id.toString(),
        'contract',
        'contract subscription',
        'you not have avaliable contracts right now',
        Channels.notification,
      );
      return next(
        new BadRequestError(
          {
            en: 'service provider not have avaliable contracts right now',
            ar: 'لا يتوفر لدى مقدم الخدمة عقود متاحة في الوقت الحالي',
          },
          req.lang,
        ),
      );
    }

    // increment the user contracts count
    const updatedUser = await Users.findOneAndUpdate(
      { _id: contract.sp },
      { $inc: { avaliableContracts: -1 } },
    );

    await ProjectContract.updateOne(
      { paymentLink: req.params.paymentSession },
      {
        status: ProjectContractStatus.updateAfterFirstPayment,
        firstCheckoutAt: new Date(),
        firstPaymentAmount: ((10 * contract.totalPrice) / 100).toFixed(2),
        secondPaymentAmount: contract.totalPrice - (10 * contract.totalPrice) / 100,
      },
    );

    await Promise.all([
      sendNotification(
        req.loggedUser.id,
        contract.sp.toString(),
        contract._id.toString(),
        'contract',
        'available contracts',
        `${user?.name} your available contracts is ${updatedUser?.avaliableContracts}`,
        Channels.notification,
      ),
      sendNotification(
        req.loggedUser.id,
        contract.sp.toString(),
        contract._id.toString(),
        'contract',
        'project contract updates',
        `${user?.name} paid 10% of the amount`,
        Channels.notification,
      ),
      sendNotification(
        req.loggedUser.id,
        req.loggedUser.id,
        contract._id.toString(),
        'contract',
        'project contract updates',
        'you paid 10% of the amount',
        Channels.notification,
      ),
    ]);


  } else if (contract.status === ProjectContractStatus.waitingForTotalPayment) {
    await ProjectContract.updateOne(
      { paymentLink: req.params.paymentSession },
      {
        status: ProjectContractStatus.ongoing,
        totalCheckoutAt: new Date(),
        secondPaymentAmount: contract.totalPrice - contract.firstPaymentAmount,
      },
    );

    await Promise.all([
      sendNotification(
        req.loggedUser.id,
        contract.sp.toString(),
        contract._id.toString(),
        'contract',
        'project contract updates',
        `${user?.name} paid the total amount`,
        Channels.notification,
      ),
      sendNotification(
        req.loggedUser.id,
        req.loggedUser.id,
        contract._id.toString(),
        'contract',
        'project contract updates',
        'you paid the total amount',
        Channels.notification,
      ),
    ]);
  } else
    return next(
      new NotAllowedError(
        {
          en: `current contract status is ${contract.status}`,
          ar: `حالة العقد الحالية هي ${contract.status}`,
        },
        req.lang,
      ),
    );

  res.status(200).json({ message: 'success' });
};




export const paymobTest: RequestHandler<{ paymentSession: string }, SuccessResponse<{ paymentUrl: string }>> = async (
  req,
  res,
) => {
  const paymob = new PaymobService();
  const authToken = await paymob.getAuthToken();
  console.log(authToken);

  const order = await paymob.createOrder(100, 'EGP', [], {
    contractId: '1234567890',
    userId: '1234567890',
  });
  console.log(order);

  const paymentKey = await paymob.getPaymentKey(order.orderId, authToken, 100, {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone_number: '01022484942',
    apartment: '123',
    floor: '123',
    street: '123',
    building: '123',
    city: '123',
    state: '123',
    country: '123',
    postal_code: '123',
  });
  console.log(paymentKey);

  const paymentUrl = paymob.createPaymentUrl(paymentKey);
  console.log(paymentUrl);

  res.status(200).json({ message: 'success', paymentUrl });
};



export const responseWebhook: RequestHandler = async (
  req,
  res,
) => {
  console.log('responseWebhook======================');
  console.log(req.body);
  console.log('responseWebhook======================');

  console.log('req.query======================');
  console.log(req.query);
  console.log('req.query======================');
  
  res.status(200).json({ message: 'success' });
};