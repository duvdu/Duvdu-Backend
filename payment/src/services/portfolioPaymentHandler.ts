import {
  Channels,
  MODELS,
  ProjectContract,
  ProjectContractStatus,
  Transaction,
  TransactionStatus,
  Users,
} from '@duvdu-v1/duvdu';

import { sendNotification } from '../controllers/webhook/sendNotification';
import {
  getOnGoingExpiration,
  getUpdateAfterFirstPaymentQueue,
} from '../utils/expirationProjectQueue';

export const handlePortfolioPayment = async (
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

    return {
      success: false,
      redirectUrl: `http://duvdu.com/contracts?contract=${contractId}&paymentStatus=failed`,
    };
  }

  const contract = await ProjectContract.findById(contractId);

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

  if (contract.status === ProjectContractStatus.waitingForFirstPayment) {
    await ProjectContract.findByIdAndUpdate(contractId, {
      status: ProjectContractStatus.updateAfterFirstPayment,
      firstCheckoutAt: new Date(),
      firstPaymentAmount: ((10 * contract.totalPrice) / 100).toFixed(2),
      secondPaymentAmount: contract.totalPrice - (10 * contract.totalPrice) / 100,
    });

    // decrement the user contracts count
    const x = await Users.findOneAndUpdate(
      { _id: contract.sp },
      { $inc: { avaliableContracts: -1 } },
      { new: true },
    );

    console.log('=====================');
    console.log(x);

    console.log('=====================');

    const delay = contract.stageExpiration * 3600 * 1000;
    const updateQueue = getUpdateAfterFirstPaymentQueue();
    if (updateQueue) {
      await updateQueue.add('update-contract', { contractId }, { delay });
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

    return {
      success: true,
      redirectUrl: `http://duvdu.com/contracts?contract=${contractId}&paymentStatus=success`,
    };
  }

  if (contract.status === ProjectContractStatus.waitingForTotalPayment) {
    await ProjectContract.findByIdAndUpdate(contractId, {
      status: ProjectContractStatus.ongoing,
      totalCheckoutAt: new Date(),
    });

    const deadlineDate =
      contract.deadline instanceof Date ? contract.deadline : new Date(contract.deadline);
    const now = new Date();
    const delay = deadlineDate.getTime() - now.getTime();

    const ongoingQueue = getOnGoingExpiration();
    if (ongoingQueue) {
      await ongoingQueue.add('update-contract', { contractId }, { delay });
    }

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
