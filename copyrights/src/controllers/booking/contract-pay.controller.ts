import {
  SuccessResponse,
  NotFound,
  BadRequestError,
  NotAllowedError,
  Users,
  Channels,
  CopyrightContracts,
  CopyrightContractStatus,
  PaymobService,
  MODELS,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

// import { contractNotification } from './contract-notification.controller';
// import {
//   getOnGoingExpirationQueue,
//   getUpdateAfterFirstPaymentExpirationQueue,
// } from '../../config/expiration-queue';
import { sendNotification } from './contract-notification.controller';

export const payContract: RequestHandler<
  { contractId: string },
  SuccessResponse<{ paymentUrl: string }>
> = async (req, res, next) => {
  const contract = await CopyrightContracts.findOne({ _id: req.params.contractId });
  if (!contract) return next(new NotFound(undefined, req.lang));

  const user = await Users.findById(req.loggedUser.id);
  if (!user) return next(new NotFound(undefined, req.lang));

  if (contract.customer.toString() !== req.loggedUser.id)
    return next(
      new NotAllowedError(
        { en: 'you are not the customer of this contract', ar: 'أنت لست عميلاً لهذا العقد' },
        req.lang,
      ),
    );

  if (contract.status === CopyrightContractStatus.waitingForFirstPayment) {
    // check if the service provider have avaliable contracts
    const sp = await Users.findById(contract.sp);
    if (sp && sp.avaliableContracts === 0) {
      await sendNotification(
        req.loggedUser.id,
        contract.sp.toString(),
        contract._id.toString(),
        'contract',
        'contract subscription',
        `${sp?.name} not have avaliable contracts right now`,
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

    await CopyrightContracts.updateOne(
      { _id: req.params.contractId },
      {
        firstPaymentAmount: ((10 * contract.totalPrice) / 100).toFixed(2),
        secondPaymentAmount: contract.totalPrice - (10 * contract.totalPrice) / 100,
      },
    );

    const paymob = new PaymobService();
    const paymentLink = await paymob.createPaymentUrlWithUserData(
      contract.firstPaymentAmount,
      req.loggedUser.id,
      contract._id.toString(),
      {
        firstName: user?.name || '',
        lastName: user?.name || '',
        email: user?.email || '',
        phone: user?.phoneNumber.number || '',
      },
      MODELS.copyrightContract,
    );

    res.status(200).json({ message: 'success', paymentUrl: paymentLink.paymentUrl });
  } else if (contract.status === CopyrightContractStatus.waitingForTotalPayment) {
    await CopyrightContracts.updateOne(
      { _id: req.params.contractId },
      {
        secondPaymentAmount: contract.totalPrice - contract.firstPaymentAmount,
      },
    );

    const paymob = new PaymobService();
    const paymentLink = await paymob.createPaymentUrlWithUserData(
      contract.secondPaymentAmount,
      req.loggedUser.id,
      contract._id.toString(),
      {
        firstName: user?.name || '',
        lastName: user?.name || '',
        email: user?.email || '',
        phone: user?.phoneNumber.number || '',
      },
      MODELS.copyrightContract,
    );

    res.status(200).json({ message: 'success', paymentUrl: paymentLink.paymentUrl });
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
};
