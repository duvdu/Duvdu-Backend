import {
  Channels,
  ContractReports,
  ProjectContract,
  ProjectContractStatus,
  Roles,
  SystemRoles,
  Users,
} from '@duvdu-v1/duvdu';
import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

import { sendSystemNotification } from '../controllers/sendNotification';

interface IcontarctQueue {
  contractId: string;
}

// Create Redis connection for BullMQ
const connection = new IORedis({
  host: process.env.REDIS_HOST?.split('://')[1]?.split(':')[0] || 'localhost',
  port: parseInt(process.env.REDIS_HOST?.split(':').pop() || '6379'),
  password: process.env.REDIS_PASS,
  maxRetriesPerRequest: null,
});

// Create queues with BullMQ
export const updateAfterFirstPaymentQueue = new Queue<IcontarctQueue>(
  'updateAfterFirstPayment-contract-pending',
  { connection },
);

export const onGoingExpiration = new Queue<IcontarctQueue>('onGoingExpiration-contract-pending', {
  connection,
});

// Define worker for updateAfterFirstPaymentQueue
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
  { connection },
);

// Define worker for onGoingExpiration
new Worker(
  'onGoingExpiration-contract-pending',
  async (job: Job<IcontarctQueue>) => {
    const contractComplain = await ContractReports.findOne({ contract: job.data.contractId });

    const contract = await ProjectContract.findOneAndUpdate(
      { _id: job.data.contractId, status: ProjectContractStatus.ongoing },
      {
        status: contractComplain
          ? ProjectContractStatus.complaint
          : ProjectContractStatus.completed,
        actionAt: new Date(),
      },
    );

    if (contractComplain) {
      // send notification for admin
      const role = await Roles.findOne({ key: SystemRoles.admin });
      const admin = await Users.findOne({ role: role?._id });
      if (admin)
        await sendSystemNotification(
          [admin._id.toString()],
          job.data.contractId,
          'contract',
          'project contract complaint',
          'project contract complaint please check it',
          Channels.update_contract,
        );
    } else {
      await sendSystemNotification(
        [contract!.sp.toString(), contract!.customer.toString()],
        contract!._id.toString(),
        'contract',
        'project contract completed',
        'project contract completed please check it',
        Channels.update_contract,
      );
    }
  },
  { connection },
);
