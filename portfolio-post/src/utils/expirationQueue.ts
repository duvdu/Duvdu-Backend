import { Channels, ProjectContract, ProjectContractStatus, getRedisClient } from '@duvdu-v1/duvdu';
import { Queue, Worker, Job } from 'bullmq';

import { sendSystemNotification } from '../controllers/book/sendNotification';

interface IcontarctQueue {
  contractId: string;
}

// Create queues with async initialization
export const createPortfolioQueues = async () => {
  const bullRedis = await getRedisClient();

  const pendingQueue = new Queue<IcontarctQueue>('project-contract-pending', {
    connection: bullRedis,
  });

  const firstPayMentQueue = new Queue<IcontarctQueue>('firstPayment-contract-pending', {
    connection: bullRedis,
  });

  const secondPayMentQueue = new Queue<IcontarctQueue>('secondPayment-contract-pending', {
    connection: bullRedis,
  });

  const updateAfterFirstPaymentQueeu = new Queue<IcontarctQueue>(
    'updateAfterFirstPayment-contract-pending',
    {
      connection: bullRedis,
    },
  );

  // Define workers to process jobs
  new Worker(
    'project-contract-pending',
    async (job: Job<IcontarctQueue>) => {
      try {
        const contract = await ProjectContract.findOneAndUpdate(
          { _id: job.data.contractId, status: ProjectContractStatus.pending },
          { status: ProjectContractStatus.canceled, actionAt: new Date() },
          { new: true },
        );

        if (contract)
          await sendSystemNotification(
            [contract.sp.toString(), contract.customer.toString()],
            contract._id.toString(),
            'contract',
            'project contract updates',
            'project contract canceled by system',
            Channels.update_contract,
          );
      } catch (error) {
        throw new Error('Failed to cancelled project contract');
      }
    },
    { connection: bullRedis },
  );

  new Worker(
    'firstPayment-contract-pending',
    async (job: Job<IcontarctQueue>) => {
      try {
        const contract = await ProjectContract.findOneAndUpdate(
          { _id: job.data.contractId, status: ProjectContractStatus.waitingForFirstPayment },
          { status: ProjectContractStatus.canceled, actionAt: new Date() },
          { new: true },
        );

        if (contract)
          await sendSystemNotification(
            [contract.sp.toString(), contract.customer.toString()],
            contract._id.toString(),
            'contract',
            'project contract updates',
            'project contract canceled by system',
            Channels.update_contract,
          );
      } catch (error) {
        throw new Error('Failed to cancelled project contract');
      }
    },
    { connection: bullRedis },
  );

  new Worker(
    'secondPayment-contract-pending',
    async (job: Job<IcontarctQueue>) => {
      try {
        const contract = await ProjectContract.findOneAndUpdate(
          { _id: job.data.contractId, status: ProjectContractStatus.waitingForTotalPayment },
          { status: ProjectContractStatus.canceled, actionAt: new Date() },
        );

        if (contract)
          await sendSystemNotification(
            [contract.sp.toString(), contract.customer.toString()],
            contract._id.toString(),
            'contract',
            'project contract updates',
            'project contract canceled by system',
            Channels.update_contract,
          );
      } catch (error) {
        throw new Error('Failed to cancelled project contract');
      }
    },
    { connection: bullRedis },
  );

  new Worker(
    'updateAfterFirstPayment-contract-pending',
    async (job: Job<IcontarctQueue>) => {
      try {
        const contract = await ProjectContract.findOneAndUpdate(
          { _id: job.data.contractId, status: ProjectContractStatus.updateAfterFirstPayment },
          { status: ProjectContractStatus.canceled, actionAt: new Date() },
        );

        if (contract)
          await sendSystemNotification(
            [contract.sp.toString(), contract.customer.toString()],
            contract._id.toString(),
            'contract',
            'project contract updates',
            'project contract canceled by system',
            Channels.update_contract,
          );
      } catch (error) {
        throw new Error('Failed to cancelled project contract');
      }
    },
    { connection: bullRedis },
  );

  return { pendingQueue, firstPayMentQueue, secondPayMentQueue, updateAfterFirstPaymentQueeu };
};

// Initialize and export
let portfolioQueues: Awaited<ReturnType<typeof createPortfolioQueues>>;
createPortfolioQueues().then((result) => {
  portfolioQueues = result;
});

export const getPendingQueue = () => portfolioQueues?.pendingQueue;
export const getFirstPaymentQueue = () => portfolioQueues?.firstPayMentQueue;
export const getSecondPaymentQueue = () => portfolioQueues?.secondPayMentQueue;
export const getUpdateAfterFirstPaymentQueue = () => portfolioQueues?.updateAfterFirstPaymentQueeu;
