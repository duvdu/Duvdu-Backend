import {
  Channels,
  ContractReports,
  RentalContracts,
  RentalContractStatus,
  Roles,
  SystemRoles,
  Users,
} from '@duvdu-v1/duvdu';
import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

import { sendSystemNotification } from '../controllers/sendNotification';

// Create Redis connection for BullMQ
const connection = new IORedis({
  host: process.env.REDIS_HOST?.split('://')[1]?.split(':')[0] || 'localhost',
  port: parseInt(process.env.REDIS_HOST?.split(':').pop() || '6379'),
  password: process.env.REDIS_PASS,
  maxRetriesPerRequest: null // Required by BullMQ
});

// Define the BullMQ queue (used for adding jobs)
export const onGoingExpiration = new Queue<{ contractId: string }>('rental_ongoing_expiration', {
  connection,
});

// Define the worker to process jobs
new Worker(
  'rental_ongoing_expiration',
  async (job: Job<{ contractId: string }>) => {
    const contractComplain = await ContractReports.findOne({ contract: job.data.contractId });

    const contract = await RentalContracts.findOneAndUpdate(
      { _id: job.data.contractId, status: RentalContractStatus.ongoing },
      {
        status: contractComplain ? RentalContractStatus.complaint : RentalContractStatus.completed,
        actionAt: new Date(),
      },
    );

    if (contractComplain) {
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
        job.data.contractId,
        'contract',
        'rental contract completed',
        'rental contract completed please check it',
        Channels.update_contract,
      );
    }
  },
  { connection },
);
