import {
  Channels,
  MODELS,
  RentalContracts,
  RentalContractStatus,
  Transaction,
  TransactionStatus,
  Users,
} from '@duvdu-v1/duvdu';

import { sendNotification } from '../controllers/sendNotification';
import { getRentalOnGoingExpiration } from '../utils/expirationRentalQueue';

export const handleRentalPayment = async (
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
    await Transaction.create({
      user: userId,
      amount: transactionData.amount,
      status: TransactionStatus.FAILED,
      contract: contractId,
      model: MODELS.studioBooking,
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

    return {
      success: false,
      redirectUrl: `http://duvdu.com/contracts?contract=${contractId}&paymentStatus=failed`,
    };
  }

  const contract = await RentalContracts.findById(contractId);

  if (!contract) {
    return {
      success: false,
      error: 'Contract not found',
      message: 'Contract is missing',
      statusCode: 400,
    };
  }

  const spUser = await Users.findById(contract?.sp);
  const user = await Users.findById(userId);

  if (contract.status === RentalContractStatus.waitingForPayment) {
    await RentalContracts.findByIdAndUpdate(contractId, {
      status: RentalContractStatus.ongoing,
      checkoutAt: new Date(),
    });

    // decrement the user contracts count
    await Users.findOneAndUpdate({ _id:contract.sp }, { $inc: { avaliableContracts: -1 } });

    const rentalQueue = getRentalOnGoingExpiration();
    if (rentalQueue) {
      await rentalQueue.add(
        'update-contract',
        { contractId },
        { delay: new Date(contract.deadline).getTime() - new Date().getTime() },
      );
    }

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
        'rental contract updates',
        `${user?.name} paid the total amount`,
        Channels.notification,
      ),
      sendNotification(
        userId,
        userId,
        contract._id.toString(),
        'contract',
        'rental contract updates',
        'you paid the total amount',
        Channels.notification,
      ),
    ]);

    await Transaction.create({
      user: userId,
      amount: contract.totalPrice,
      status: TransactionStatus.SUCCESS,
      contract: contract._id.toString(),
      model: MODELS.studioBooking,
      currency: 'EGP',
      timeStamp: new Date(),
    });

    return {
      success: true,
      redirectUrl: `http://duvdu.com/contracts?contract=${contractId}&paymentStatus=success`,
    };
  }

  // If we reach here, it means the contract status was neither waitingForFirstPayment nor waitingForTotalPayment
  return {
    success: false,
    redirectUrl: `http://duvdu.com/contracts?contract=${contractId}&paymentStatus=failed`,
  };
};
