import { Channels, MODELS, Transaction, TransactionStatus, Users } from '@duvdu-v1/duvdu';

import { sendNotification } from '../controllers/webhook/sendNotification';

export const handleSubscribePayment = async (
  userId: string,
  contractId: string,
  transactionData: {
    amount: number;
    success: boolean;
  },
) => {
  // Check if payment was successful
  if (!transactionData.success) {
    console.log('Payment failed');
    await Transaction.findByIdAndUpdate(contractId, {
      status: TransactionStatus.FAILED,
    });

    await sendNotification(
      userId,
      userId,
      contractId,
      MODELS.transaction,
      'payment failed',
      'your payment failed for new subscription, please try again',
      Channels.notification,
    );

    return {
      success: false,
      redirectUrl: 'http://duvdu.com/contracts?paymentStatus=failed',
    };
  }

  const contract = await Transaction.findById(contractId);

  if (!contract) {
    return {
      success: false,
      error: 'Transaction not found',
      message: 'Transaction is missing',
      statusCode: 400,
    };
  }

  // increment the user contracts count
  const user = await Users.findByIdAndUpdate(
    userId,
    {
      $inc: { avaliableContracts: 5 },
    },
    { new: true },
  );

  await sendNotification(
    userId,
    userId,
    contractId,
    MODELS.transaction,
    'payment success',
    `your payment success for new subscription, you now have ${user?.avaliableContracts} contracts`,
    Channels.notification,
  );

  // If we reach here, it means the contract status was neither waitingForFirstPayment nor waitingForTotalPayment
  return {
    success: false,
    redirectUrl: 'http://duvdu.com/contracts?paymentStatus=failed',
  };
};
