import { Channels, ContractReports, RentalContracts, RentalContractStatus, getRedisClient } from '@duvdu-v1/duvdu';
import { Queue, Worker, Job } from 'bullmq';

import { sendSystemNotification } from '../controllers/booking/contract-notification.controller';

// Initialize Redis connection for BullMQ
const initializeBullRedis = async () => {
  return await getRedisClient();
};

// Create queues with BullMQ using async initialization
export const createQueues = async () => {
  const bullRedis = await initializeBullRedis();

  const pendingExpiration = new Queue<{ contractId: string }>(
    'rental_pending_expiration',
    { connection: bullRedis }
  );

  const paymentExpiration = new Queue<{ contractId: string }>(
    'rental_payment_expiration',
    { connection: bullRedis }
  );

  const onGoingExpiration = new Queue<{ contractId: string }>(
    'rental_ongoing_expiration',
    { connection: bullRedis }
  );

  // Define workers to process jobs
  new Worker(
    'rental_pending_expiration',
    async (job: Job<{ contractId: string }>) => {
      const contract = await RentalContracts.findOneAndUpdate(
        { _id: job.data.contractId, status: RentalContractStatus.pending },
        { status: RentalContractStatus.canceled, actionAt: new Date() },
      );

      if (contract)
        await sendSystemNotification(
          [contract.sp.toString(), contract.customer.toString()],
          contract._id.toString(),
          'contract',
          'rental contract updates',
          'contract canceled by system',
          Channels.update_contract,
        );
    },
    { connection: bullRedis }
  );

  new Worker(
    'rental_payment_expiration',
    async (job: Job<{ contractId: string }>) => {
      const contract = await RentalContracts.findOneAndUpdate(
        { _id: job.data.contractId, status: RentalContractStatus.waitingForPayment },
        { status: RentalContractStatus.canceled, actionAt: new Date() },
      );

      if (contract)
        await sendSystemNotification(
          [contract.sp.toString(), contract.customer.toString()],
          contract._id.toString(),
          'contract',
          'rental contract updates',
          'contract canceled by system',
          Channels.update_contract,
        );
    },
    { connection: bullRedis }
  );

  new Worker(
    'rental_ongoing_expiration',
    async (job: Job<{ contractId: string }>) => {
      const contractComplain = await ContractReports.findOne({ contract: job.data.contractId });

      await RentalContracts.findOneAndUpdate(
        { _id: job.data.contractId, status: RentalContractStatus.ongoing },
        {
          status: contractComplain ? RentalContractStatus.complaint : RentalContractStatus.completed,
          actionAt: new Date(),
        },
      );

      if (contractComplain) {
        // send notification for admin
      } else {
        // send total amount to sp & save transaction
      }
    },
    { connection: bullRedis }
  );

  return { pendingExpiration, paymentExpiration, onGoingExpiration };
};

// Initialize and export
let queues: Awaited<ReturnType<typeof createQueues>>;
createQueues().then((result) => {
  queues = result;
});

export const getPendingExpiration = () => queues?.pendingExpiration;
export const getPaymentExpiration = () => queues?.paymentExpiration;
export const getOnGoingExpiration = () => queues?.onGoingExpiration;
