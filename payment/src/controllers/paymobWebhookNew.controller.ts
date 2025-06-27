import { Channels, MODELS, PaymobService, Transaction, TransactionStatus } from '@duvdu-v1/duvdu';
import { RequestHandler } from 'express';

import { sendNotification } from './sendNotification';
import { handlePortfolioPayment } from '../services/portfolioPaymentHandler';
import { handleRentalPayment } from '../services/rentalPaymentHandler copy';

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

    // Ensure we have valid strings for userId and contractId
    const parts = name.split('-');
    const userId = parts[0] || '';
    const contractId = parts[1] || '';
    const service_type = description || 'unknown';

    console.log('=======================');
    console.log('userId', userId);
    console.log('contractId', contractId);
    console.log('service_type', service_type);
    console.log('=======================');

    console.log('=======================');
    console.log('transactionData status', transactionData.success);
    console.log('=======================');

    // Ensure userId and contractId are valid
    if (!userId || !contractId) {
      return res.status(400).json({
        error: 'Invalid payment data',
        message: 'User ID or Contract ID is missing',
      });
    }

    // Handle payment based on service type
    if (service_type === MODELS.portfolioPost) {
      const result = await handlePortfolioPayment(userId, contractId, {
        amount: transactionData.amount,
        success: transactionData.success,
      });

      if (result.statusCode) {
        return res.status(result.statusCode).json({
          error: result.error,
          message: result.message,
        });
      }

      return res.redirect(
        result.redirectUrl ||
          `http://duvdu.com/contracts?contract=${contractId}&paymentStatus=success`,
      );
    } else if (service_type === MODELS.studioBooking) {
      const result = await handleRentalPayment(userId, contractId, {
        amount: transactionData.amount,
        success: transactionData.success,
      });

      if (result.statusCode) {
        return res.status(result.statusCode).json({
          error: result.error,
          message: result.message,
        });
      }

      return res.redirect(
        result.redirectUrl ||
          `http://duvdu.com/contracts?contract=${contractId}&paymentStatus=success`,
      );
    }

    // Handle other service types here if needed

    // Default fallback for unhandled service types or failed payments
    console.log('❌ Unhandled service type or payment failed');

    await Transaction.create({
      user: userId,
      amount: transactionData.amount,
      status: TransactionStatus.FAILED,
      contract: contractId,
      model: service_type,
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
