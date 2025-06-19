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
  Transaction,
  TransactionStatus,
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

    console.log('==========from webhook=============');
    console.log('req.query', req.query);
    console.log('==========from webhook=============');


    const paymobService = new PaymobService();

    const result = await paymobService.handleWebhookQueryWithItems(
      req.query as Record<string, string>,
    );

    console.log('==========from webhook=============');
    console.log('result', result);
    console.log('==========from webhook=============');

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

    console.log('=======================');
    console.log('orderDetails:', orderDetails);
    console.log('merchant_order_id:', orderDetails.merchant_order_id);
    console.log('merchant_order_id type:', typeof orderDetails.merchant_order_id);
    console.log('=======================');

    // Extract custom data from multiple possible sources
    let customData = null;
    
    // Try to get from merchant_order_id first
    try {
      if (orderDetails.merchant_order_id) {
        customData = JSON.parse(orderDetails.merchant_order_id);
        console.log('✅ Custom data from merchant_order_id:', customData);
      } else {
        console.log('❌ merchant_order_id is empty or undefined');
      }
    } catch (error) {
      console.log('Failed to parse merchant_order_id as JSON:', orderDetails.merchant_order_id);
      console.log('Parse error:', error);
    }

    // If no custom data from merchant_order_id, try multiple fallback methods
    if (!customData) {
      console.log('🔍 Trying fallback methods to extract custom data...');
      
      // Method 1: Extract from item description
      if (transactionData.items && transactionData.items.length > 0) {
        try {
          const item = transactionData.items[0];
          console.log('Item description:', item.description);
          
          // Look for our custom data pattern
          const customDataMatch = item.description.match(/CUSTOM_DATA:(.*?):END_CUSTOM_DATA/);
          if (customDataMatch) {
            customData = JSON.parse(customDataMatch[1]);
            console.log('✅ Custom data extracted from item description:', customData);
          }
        } catch (error) {
          console.log('Failed to extract from item description:', error);
        }
      }
      
      // Method 2: Extract from merchant_order_id as fallback pattern
      if (!customData) {
        try {
          // Sometimes the merchant_order_id might be available in a different format
          console.log('Trying alternative merchant_order_id patterns...');
        } catch (error) {
          console.log('Failed alternative extraction:', error);
        }
      }
    }

    console.log('=======================');
    console.log('customData', customData);
    console.log('=======================');
    

    if (!customData || !customData.userId || !customData.contractId) {
      console.log('❌ Missing required custom data fields');
      return res.status(400).json({
        error: 'Missing data',
        message: 'Required custom data fields are missing',
      });
    }

    const { userId, contractId, service_type } = customData;

    // Check if payment was successful
    if (transactionData.success) {
      console.log('💰 Payment successful');

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
          await ProjectContract.findByIdAndUpdate(
            contractId,
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

          await Transaction.create({
            user: userId,
            amount: contract.firstPaymentAmount,
            status: TransactionStatus.SUCCESS,
            contract: contract._id.toString(),
            model: MODELS.portfolioPost,
            currency: 'EGP',
            timeStamp: new Date(),
          });

          return res.redirect(`http://duvdu.com/contracts?contract=${contractId}&paymentStatus=success`);
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

          return res.redirect(`http://duvdu.com/contracts?contract=${contractId}&paymentStatus=success`);
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
        (req.query.merchant_order_id && JSON.parse(req.query.merchant_order_id as string).contractId) ||
        (req.body?.obj?.order?.merchant_order_id && JSON.parse(req.body.obj.order.merchant_order_id).contractId);
      
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
