import {
  Channels,
  MODELS,
  PaymobService,
  ProjectContract,
  ProjectContractStatus,
  Transaction,
  TransactionStatus,
  Users,
} from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from './sendNotification';
import { updateAfterFirstPaymentQueue } from '../utils/expirationProjectQueue';

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

    // Extract custom data from merchant_order_id if available
    const { name, description } = orderDetails.items[0];

    const [userId, contractId] = name.split('-');
    const service_type = description;

    console.log('=======================');
    console.log('userId', userId);
    console.log('contractId', contractId);
    console.log('service_type', service_type);
    console.log('=======================');

    // Check if payment was successful
    if (transactionData.success) {
      console.log('💰 Payment successful');

      if (service_type === MODELS.portfolioPost) {
        const contract = await ProjectContract.findById(contractId);

        const spUser = await Users.findById(contract?.sp);
        const user = await Users.findById(userId);

        if (!contract) {
          return res.status(400).json({
            error: 'Contract not found',
            message: 'Contract is missing',
          });
        }
        if (contract.status === ProjectContractStatus.waitingForFirstPayment) {
          await ProjectContract.findByIdAndUpdate(contractId, {
            status: ProjectContractStatus.updateAfterFirstPayment,
            firstCheckoutAt: new Date(),
            firstPaymentAmount: ((10 * contract.totalPrice) / 100).toFixed(2),
            secondPaymentAmount: contract.totalPrice - (10 * contract.totalPrice) / 100,
          });

          const delay = contract.stageExpiration * 3600 * 1000;
          await updateAfterFirstPaymentQueue.add({ contractId: contractId }, { delay });

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

          await Transaction.create({
            user: userId,
            amount: contract.firstPaymentAmount,
            status: TransactionStatus.SUCCESS,
            contract: contract._id.toString(),
            model: MODELS.portfolioPost,
            currency: 'EGP',
            timeStamp: new Date(),
          });

          return res.redirect(
            `http://duvdu.com/contracts?contract=${contractId}&paymentStatus=success`,
          );
        }

        if (contract.status === ProjectContractStatus.waitingForTotalPayment) {
          await ProjectContract.findByIdAndUpdate(contractId, {
            status: ProjectContractStatus.ongoing,
            totalCheckoutAt: new Date(),
          });

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

          await Transaction.create({
            user: userId,
            amount: contract.secondPaymentAmount,
            status: TransactionStatus.SUCCESS,
            contract: contract._id.toString(),
            model: MODELS.portfolioPost,
            currency: 'EGP',
            timeStamp: new Date(),
          });

          return res.redirect(
            `http://duvdu.com/contracts?contract=${contractId}&paymentStatus=success`,
          );
        }
      }

      // If we reach here, it means the contract status was neither waitingForFirstPayment nor waitingForTotalPayment
      return res.redirect(`http://duvdu.com/contracts?contract=${contractId}&paymentStatus=failed`);
    } else {
      console.log('❌ Payment failed');
      await Transaction.create({
        user: userId,
        amount: transactionData.amount,
        status: TransactionStatus.FAILED,
        contract: contractId,
        model: MODELS.portfolioPost,
        currency: 'EGP',
        timeStamp: new Date(),
      });

      await sendNotification(
        userId,
        userId,
        contractId,
        'contract',
        'payment failed',
        'your payment failed, please try again',
        Channels.notification,
      );

      return res.redirect(`http://duvdu.com/contracts?contract=${contractId}&paymentStatus=failed`);
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);

    // Extract contractId from query params if available for error redirection
    let redirectUrl = 'http://duvdu.com/contracts?paymentStatus=failed';

    try {
      // Try to get contractId from request query or body
      const contractId =
        (req.query.merchant_order_id &&
          JSON.parse(req.query.merchant_order_id as string).contractId) ||
        (req.body?.obj?.order?.merchant_order_id &&
          JSON.parse(req.body.obj.order.merchant_order_id).contractId);

      if (contractId) {
        redirectUrl = `http://duvdu.com/contracts?contract=${contractId}&paymentStatus=failed`;
      }
    } catch (parseError) {
      console.error('Failed to extract contractId for error redirect:', parseError);
    }

    // Still return a redirect to prevent Paymob from retrying
    return res.redirect(redirectUrl);
  }
};
