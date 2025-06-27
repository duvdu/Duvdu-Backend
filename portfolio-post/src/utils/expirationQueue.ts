import { Channels, ProjectContract, ProjectContractStatus, bullRedis } from '@duvdu-v1/duvdu';
import { Queue, Worker, Job } from 'bullmq';

import { sendSystemNotification } from '../controllers/book/sendNotification';

interface IcontarctQueue {
  contractId: string;
}

// Define the BullMQ queues
export const pendingQueue = new Queue<IcontarctQueue>('project-contract-pending', {
  connection: bullRedis,
});

export const firstPayMentQueue = new Queue<IcontarctQueue>(
  'firstPayment-contract-pending',
  {
    connection: bullRedis,
  },
);

export const secondPayMentQueue = new Queue<IcontarctQueue>(
  'secondPayment-contract-pending',
  {
    connection: bullRedis,
  },
);

export const updateAfterFirstPaymentQueeu = new Queue<IcontarctQueue>(
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
