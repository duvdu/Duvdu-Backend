import {
  BadRequestError,
  Channels,
  NotAllowedError,
  NotFound,
  SuccessResponse,
  Users,
  ProjectContract,
  ProjectContractStatus,
  MODELS,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from './sendNotification';
import { PaymobService } from '../../services/paymob.service';

export const payContract: RequestHandler<
  { contractId: string },
  SuccessResponse<{ paymentUrl: string }>
> = async (req, res, next) => {
  const contract = await ProjectContract.findOne({ _id: req.params.contractId });
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

  if (contract.customer.toString() !== req.loggedUser.id)
    return next(
      new NotAllowedError(
        { en: 'you are not the customer of this contract', ar: 'أنت لست عميلاً لهذا العقد' },
        req.lang,
      ),
    );

  if (contract.status === ProjectContractStatus.waitingForFirstPayment) {
    await ProjectContract.updateOne(
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
      MODELS.portfolioPost,
    );

    res.status(200).json({ message: 'success', paymentUrl: paymentLink.paymentUrl });
  } else if (contract.status === ProjectContractStatus.waitingForTotalPayment) {
    await ProjectContract.updateOne(
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
      MODELS.portfolioPost,
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

export const createPaymentUrl: RequestHandler<
  unknown,
  SuccessResponse<{ paymentUrl: string }>,
  {
    amount: number;
    userId: string;
    contractId: string;
    user: { firstName: string; lastName: string; email: string; phone: string };
    model: MODELS;
  }
> = async (req, res) => {
  const paymob = new PaymobService();
  const paymentLink = await paymob.createPaymentUrlWithUserData(
    req.body.amount,
    req.body.userId,
    req.body.contractId,
    req.body.user,
    req.body.model,
  );

  res.status(200).json({ message: 'success', paymentUrl: paymentLink.paymentUrl });
};

export const responseWebhook: RequestHandler = async (req, res) => {
  try {
    const paymobService = new PaymobService();

    const result = await paymobService.handleWebhookQueryWithItems(
      req.query as Record<string, string>,
    );

    if (!result.isValid) {
      console.log('❌ Invalid webhook signature');
      return res.status(400).json({
        error: 'Invalid webhook signature',
        message: 'Webhook verification failed',
      });
    }

    if (!result.transactionData) {
      console.log('❌ No transaction data found');
      return res.status(400).json({
        error: 'No transaction data',
        message: 'Transaction data is missing',
      });
    }

    const { transactionData } = result;

    // Get order details to access merchant_order_id
    const orderDetails = await paymobService.getOrderDetails(transactionData.orderId);

    console.log('✅ Valid webhook received:', {
      transactionId: transactionData.transactionId,
      orderId: transactionData.orderId,
      amount: transactionData.amount,
      success: transactionData.success,
      currency: transactionData.currency,
      items: transactionData.items,
    });

    // Check if payment was successful
    if (transactionData.success) {
      console.log('💰 Payment successful');

      // Extract custom data from merchant_order_id if available
      let customData = null;
      try {
        if (orderDetails.merchant_order_id) {
          customData = JSON.parse(orderDetails.merchant_order_id);
          console.log('Custom data from merchant_order_id:', customData);
        }
      } catch (error) {
        console.log('Failed to parse merchant_order_id as JSON:', orderDetails.merchant_order_id);
      }

      const { userId, contractId, service_type } = customData;

      if (service_type === MODELS.portfolioPost) {
        const contract = await ProjectContract.findById(contractId);

        const spUser = await Users.findById(contract?.sp);
        const user = await Users.findById(userId);

        if (!contract) {
          console.log('❌ Contract not found');
          return res.status(400).json({
            error: 'Contract not found',
            message: 'Contract is missing',
          });
        }
        if (contract.status === ProjectContractStatus.waitingForFirstPayment) {
          await ProjectContract.updateOne(
            { _id: req.params.contractId },
            {
              status: ProjectContractStatus.updateAfterFirstPayment,
              firstCheckoutAt: new Date(),
              firstPaymentAmount: ((10 * contract.totalPrice) / 100).toFixed(2),
              secondPaymentAmount: contract.totalPrice - (10 * contract.totalPrice) / 100,
            },
          );

          await Promise.all([
            sendNotification(
              userId,
              contract.sp.toString(),
              contract._id.toString(),
              'contract',
              'available contracts',
              `${spUser?.name} your available contracts is ${spUser?.avaliableContracts}`,
              Channels.notification,
            ),
            sendNotification(
              userId,
              contract.sp.toString(),
              contract._id.toString(),
              'contract',
              'project contract updates',
              `${user?.name} paid 10% of the amount`,
              Channels.notification,
            ),
            sendNotification(
              userId,
              userId,
              contract._id.toString(),
              'contract',
              'project contract updates',
              'you paid 10% of the amount',
              Channels.notification,
            ),
          ]);
        }

        if (contract.status === ProjectContractStatus.waitingForTotalPayment) {
          contract.status = ProjectContractStatus.ongoing;
          contract.totalCheckoutAt = new Date();

          await Promise.all([
            sendNotification(
              userId,
              contract.sp.toString(),
              contract._id.toString(),
              'contract',
              'project contract updates',
              `${user?.name} paid the total amount`,
              Channels.notification,
            ),
            sendNotification(
              userId,
              userId,
              contract._id.toString(),
              'contract',
              'project contract updates',
              'you paid the total amount',
              Channels.notification,
            ),
          ]);
        }

        await contract.save();
      }
    } else {
      console.log('❌ Payment failed');
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({
      message: 'Webhook processed successfully',
      transactionId: transactionData.transactionId,
      success: transactionData.success,
    });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);

    // Still return 200 to prevent Paymob from retrying
    // but log the error for investigation
    res.status(200).json({
      message: 'Webhook received but processing failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
