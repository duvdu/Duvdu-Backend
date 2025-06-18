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

  // Store custom data in merchant_order_id as JSON string
  const customData = {
    contractId: '1234567890',
    userId: '1234567890',
    service_type: 'portfolio_booking',
    booking_id: 'BOOK_' + Date.now(),
    user_name: 'John Doe',
    payment_type: 'test_payment',
    timestamp: new Date().toISOString(),
  };

  const order = await paymob.createOrder(100, 'EGP', [{
    name: 'Portfolio Service',
    amount_cents: 10000,
    description: 'Portfolio booking service',
    quantity: 1,
  }], JSON.stringify(customData));
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
  try {
    console.log('Paymob webhook received');
    console.log('Query params:', req.query);
    
    // Initialize PaymobService
    const paymobService = new PaymobService();
    
    // Handle webhook with items (makes API call to get order details)
    const result = await paymobService.handleWebhookQueryWithItems(req.query as Record<string, string>);
    
    if (!result.isValid) {
      console.log('❌ Invalid webhook signature');
      return res.status(400).json({ 
        error: 'Invalid webhook signature',
        message: 'Webhook verification failed' 
      });
    }
    
    if (!result.transactionData) {
      console.log('❌ No transaction data found');
      return res.status(400).json({ 
        error: 'No transaction data',
        message: 'Transaction data is missing' 
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
      
      // Extract items for your business logic
      const items = transactionData.items;
      console.log('Items:', items);
      
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
      
      // TODO: Implement your business logic here
      // Example:
      // - Update booking status in database
      // - Send confirmation email
      // - Update user credits/balance
      // - Process the specific service based on custom data
      
      // Example custom data usage:
      if (customData) {
        if (customData.userId) {
          console.log(`Processing payment for user: ${customData.userId}`);
          // Update user's booking/payment status
        }
        
        if (customData.booking_id) {
          console.log(`Processing booking: ${customData.booking_id}`);
          // Update booking status to paid
        }
        
        if (customData.service_type) {
          console.log(`Service type: ${customData.service_type}`);
          // Handle different service types
        }
        
        if (customData.contractId) {
          console.log(`Processing contract: ${customData.contractId}`);
          // Update contract status
        }
      }
      
      // Example items usage (for standard order items):
      if (items && items.length > 0) {
        const firstItem = items[0];
        console.log(`Item: ${firstItem.name} - ${firstItem.description}`);
        console.log(`Amount: ${firstItem.amount_cents / 100} ${transactionData.currency}`);
      }
      
    } else {
      console.log('❌ Payment failed');
      
      // TODO: Handle failed payment
      // - Update booking status to failed
      // - Send failure notification
      // - Log the failure reason
      
      console.log('Failure details:', {
        responseCode: transactionData.responseCode,
        message: transactionData.message,
      });
    }
    
    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ 
      message: 'Webhook processed successfully',
      transactionId: transactionData.transactionId,
      success: transactionData.success 
    });
    
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    
    // Still return 200 to prevent Paymob from retrying
    // but log the error for investigation
    res.status(200).json({ 
      message: 'Webhook received but processing failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};