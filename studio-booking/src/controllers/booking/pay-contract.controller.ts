import {
  SuccessResponse,
  NotFound,
  BadRequestError,
  Users,
  Channels,
  RentalContracts,
  RentalContractStatus,
  PaymobService,
  MODELS,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from './contract-notification.controller';

export const payContract: RequestHandler<
  { contractId: string },
  SuccessResponse<{ paymentUrl: string }>
> = async (req, res, next) => {
  const contract = await RentalContracts.findOne({ _id: req.params.contractId });
  if (!contract) return next(new NotFound(undefined, req.lang));

  const customer = await Users.findById(req.loggedUser.id);
  if (!customer) return next(new NotFound(undefined, req.lang));

  // check if the service provider have avaliable contracts
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

  if (contract.status === RentalContractStatus.waitingForPayment) {
    const paymob = new PaymobService();
    const paymentLink = await paymob.createPaymentUrlWithUserData(
      contract.totalPrice,
      req.loggedUser.id,
      contract._id.toString(),
      {
        firstName: user?.name || '',
        lastName: user?.name || '',
        email: user?.email || '',
        phone: user?.phoneNumber.number || '',
      },
      MODELS.studioBooking,
    );

    await RentalContracts.findByIdAndUpdate(
      { _id: req.params.contractId },
      { status: RentalContractStatus.ongoing, checkoutAt: new Date() },
    );

    await Promise.all([
      sendNotification(
        req.loggedUser.id,
        contract.sp.toString(),
        contract._id.toString(),
        'contract',
        'available contracts',
        `${user?.name} your available contracts is ${user?.avaliableContracts}`,
        Channels.notification,
      ),
      sendNotification(
        req.loggedUser.id,
        contract.sp.toString(),
        contract._id.toString(),
        'contract',
        'rental contract updates',
        `${customer?.name} pay rental contract`,
        Channels.notification,
      ),
      sendNotification(
        req.loggedUser.id,
        req.loggedUser.id,
        contract._id.toString(),
        'contract',
        'rental contract updates',
        'you pay rental contract successfully',
        Channels.notification,
      ),
    ]);

    res.status(200).json({ message: 'success', paymentUrl: paymentLink.paymentUrl });
  } else {
    return next(
      new BadRequestError(
        {
          en: 'contract is not in waiting for payment status',
          ar: 'العقد غير في حالة الإنتظار للدفع',
        },
        req.lang,
      ),
    );
  }
};
