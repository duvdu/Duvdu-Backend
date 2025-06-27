import {
  Channels,
  ContractReports,
  ProjectContract,
  ProjectContractStatus,
  Roles,
  SystemRoles,
  Users,
  redisConnection
} from '@duvdu-v1/duvdu';
import { Queue, Worker, Job } from 'bullmq';

import { sendSystemNotification } from '../controllers/sendNotification';

interface IcontarctQueue {
  contractId: string;
}

// Initialize the queues and workers
let updateAfterFirstPaymentQueue: Queue<IcontarctQueue>;
let onGoingExpiration: Queue<IcontarctQueue>;

// Function to initialize BullMQ with the Redis connection
export const initializeProjectQueues = async () => {
  try {
    // Get the Redis client from the shared connection
    await redisConnection('', '');
    
    // Create connection options for BullMQ
    const connectionOpts = {
      host: process.env.REDIS_HOST?.split('://')[1]?.split(':')[0] || 'localhost',
      port: parseInt(process.env.REDIS_HOST?.split(':').pop() || '6379'),
      password: process.env.REDIS_PASS,
      maxRetriesPerRequest: null
    };
    
    // Create the queues
    updateAfterFirstPaymentQueue = new Queue<IcontarctQueue>(
      'updateAfterFirstPayment-contract-pending',
      { connection: connectionOpts }
    );
    
    onGoingExpiration = new Queue<IcontarctQueue>(
      'onGoingExpiration-contract-pending',
      { connection: connectionOpts }
    );
    
    // Create the workers
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
      { connection: connectionOpts }
    );

    new Worker(
      'onGoingExpiration-contract-pending',
      async (job: Job<IcontarctQueue>) => {
        const contractComplain = await ContractReports.findOne({ contract: job.data.contractId });

        const contract = await ProjectContract.findOneAndUpdate(
          { _id: job.data.contractId, status: ProjectContractStatus.ongoing },
          {
            status: contractComplain ? ProjectContractStatus.complaint : ProjectContractStatus.completed,
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
      { connection: connectionOpts }
    );
    
    console.log('Project queues initialized successfully');
  } catch (error) {
    console.error('Failed to initialize project queues:', error);
  }
};

// Export the queues
export { updateAfterFirstPaymentQueue, onGoingExpiration };
